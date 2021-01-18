CREATE OR REPLACE FUNCTION insert_role_or_reject()
RETURNS trigger AS $$
DECLARE
    no_role constant VARCHAR(2) := 'na';
    user_role VARCHAR(11);
BEGIN
    -- Check if the invitation exist in the invitations table
    SELECT coalesce(
        (SELECT role FROM invitations where email = NEW.email),
        no_role
    ) INTO user_role;

    -- If there is no invitation raise an exception
    IF user_role = no_role THEN
        RAISE EXCEPTION 'No invitation';
    END IF;

    -- Update the invitation table
    UPDATE invitations SET used = true WHERE email = NEW.email;

    NEW.role = user_role;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS insert_role_or_reject_trigger ON "users";
CREATE TRIGGER insert_role_or_reject_trigger
    BEFORE INSERT ON "users"
    FOR EACH ROW
    EXECUTE PROCEDURE insert_role_or_reject();

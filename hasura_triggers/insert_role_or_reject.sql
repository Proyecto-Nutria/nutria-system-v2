CREATE OR REPLACE FUNCTION insert_role_or_reject()
RETURNS trigger AS $$
DECLARE
    user_role VARCHAR(11);
BEGIN
    -- Get the user role from the invitation table
    SELECT role FROM invitations where email = NEW.email;

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

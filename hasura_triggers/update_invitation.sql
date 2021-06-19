CREATE OR REPLACE FUNCTION update_invitation()
RETURNS trigger AS $$
DECLARE
    used_invitation BOOLEAN;
BEGIN
    -- Get the used field of invitation table
    SELECT used FROM invitations WHERE email = NEW.email INTO used_invitation;

    -- Update the invitation table
    IF used_invitation = false THEN
        UPDATE invitations SET used = true WHERE email = NEW.email;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invitation_trigger ON "users";
CREATE TRIGGER update_invitation_trigger
    AFTER INSERT ON "users"
    FOR EACH ROW
    EXECUTE PROCEDURE update_invitation();
CREATE OR REPLACE FUNCTION update_invitation()
RETURNS trigger AS $$
DECLARE
    used_invitation BOOLEAN;
    user_email text;
BEGIN
    -- Get the used field of invitation table
    SELECT email FROM users WHERE auth0_id = NEW.user_id INTO user_email;
    SELECT used FROM invitations WHERE email = user_email INTO used_invitation;

    -- Update the invitation table
    IF used_invitation = false THEN
        UPDATE invitations SET used = true WHERE email = user_email;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invitation_interviewee_trigger ON "interviewees";
CREATE TRIGGER update_invitation_interviewee_trigger
    AFTER INSERT ON "interviewees"
    FOR EACH ROW
    EXECUTE PROCEDURE update_invitation();

DROP TRIGGER IF EXISTS update_invitation_interviewer_trigger ON "interviewers";
CREATE TRIGGER update_invitation_interviewer_trigger
    AFTER INSERT ON "interviewers"
    FOR EACH ROW
    EXECUTE PROCEDURE update_invitation();

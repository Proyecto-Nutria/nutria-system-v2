CREATE OR REPLACE FUNCTION insert_emails()
RETURNS trigger AS $$
DECLARE
    interviewee_email text;
DECLARE
    interviewer_email text;
BEGIN
    -- Get interviewee & interviewer email
    SELECT email FROM users WHERE auth0_id = NEW.interviewee_id INTO interviewee_email;
    SELECT email FROM users WHERE auth0_id = NEW.interviewer_id INTO interviewer_email;

    NEW.interviewee_email = interviewee_email;
    NEW.interviewer_email = interviewer_email;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS insert_emails_trigger ON "interviews";
CREATE TRIGGER insert_emails_trigger
    BEFORE INSERT ON "interviews"
    FOR EACH ROW
    EXECUTE PROCEDURE insert_emails();
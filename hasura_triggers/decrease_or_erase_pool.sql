-- If you erase pools for some reason you need to add manually the availability column
-- ALTER TABLE pools ADD COLUMN availability tsrange[];
-- e.g. {"[2010-01-01 14:30, 2010-01-01 15:30]","[2010-01-01 14:30, 2010-01-01 15:30]"}

CREATE OR REPLACE FUNCTION decrease_or_erase_pool()
RETURNS trigger AS $$
DECLARE
    pool_awaiting smallint;
    pool_scheduled smallint;
BEGIN
    -- Get the pool id that is going to be modified
    SELECT awaiting, scheduled
    FROM pools
    WHERE interviewee_id = NEW.interviewee_id
    INTO pool_awaiting, pool_scheduled;

    pool_scheduled := pool_scheduled +1;
    IF pool_awaiting = pool_scheduled THEN
        DELETE FROM pools WHERE interviewee_id = NEW.interviewee_id;
    ELSE
        UPDATE pools
        SET scheduled = pool_scheduled
        WHERE interviewee_id = NEW.interviewee_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS decrease_or_erase_pool_trigger ON "interviews";
CREATE TRIGGER decrease_or_erase_pool_trigger
    AFTER INSERT ON "interviews"
    FOR EACH ROW
    EXECUTE PROCEDURE decrease_or_erase_pool();

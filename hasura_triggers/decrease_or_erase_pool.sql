-- If you erase pools for some reason you need to add manually the availability column
-- ALTER TABLE pools ADD COLUMN availability tsrange[];
-- e.g. {"[2010-01-01 14:30, 2010-01-01 15:30]","[2010-01-01 14:30, 2010-01-01 15:30]"}

CREATE OR REPLACE FUNCTION decrease_or_erase_pool()
RETURNS trigger AS $$
BEGIN
    -- If there are no more awating interviews to be made, erase it from pool
    IF OLD.awaiting = NEW.scheduled THEN
        DELETE FROM pools WHERE id = NEW.id;
        RETURN NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS decrease_or_erase_pool_trigger ON "pools";
CREATE TRIGGER decrease_or_erase_pool_trigger
    AFTER UPDATE ON "pools"
    FOR EACH ROW
    EXECUTE PROCEDURE decrease_or_erase_pool();

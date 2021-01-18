CREATE OR REPLACE FUNCTION assign_room()
RETURNS trigger AS $$
DECLARE
    last_occupied_room smallint;
BEGIN
    -- Get the last ocuppied room
    SELECT last_room FROM room where id = 1 INTO last_occupied_room;

    -- Reset the room if you reached the limit
    IF last_occupied_room = 10 THEN
        last_occupied_room := 1;
    ELSE
        last_occupied_room := last_occupied_room +1;
    END IF;

    -- Update the last ocuppied room
    UPDATE room SET last_room = last_occupied_room WHERE id = 1;

    -- Put the room in the data
    NEW.room = last_occupied_room;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS assign_room_trigger ON "interviews";
CREATE TRIGGER assign_room_trigger
    BEFORE INSERT ON "interviews"
    FOR EACH ROW
    EXECUTE PROCEDURE assign_room();
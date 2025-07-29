CREATE OR REPLACE FUNCTION generate_promo_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INT := 0;
BEGIN
    FOR i IN 1..5 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1), 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION set_random_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.code := generate_promo_code();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_generate_code
BEFORE INSERT ON promo_codes
FOR EACH ROW
WHEN (NEW.code IS NULL)
EXECUTE FUNCTION set_random_code();

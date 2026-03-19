-- Execute this securely in the Supabase SQL Editor
ALTER TABLE sites ADD COLUMN IF NOT EXISTS featured_score integer DEFAULT 0;

CREATE OR REPLACE FUNCTION recalculate_featured_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    site_record RECORD;
    score INTEGER;
    img_len INTEGER;
    desc_len INTEGER;
    has_tours BOOLEAN;
BEGIN
    FOR site_record IN SELECT * FROM sites LOOP
        score := 0;

        -- 3+ images: 25, 1-2 images: 15
        IF site_record.images IS NOT NULL AND jsonb_typeof(site_record.images) = 'array' THEN
            img_len := jsonb_array_length(site_record.images);
            IF img_len >= 3 THEN
                score := score + 25;
            ELSIF img_len >= 1 THEN
                score := score + 15;
            END IF;
        END IF;

        -- description > 200 chars: 10
        IF site_record.description IS NOT NULL THEN
            desc_len := length(site_record.description);
            IF desc_len > 200 THEN
                score := score + 10;
            END IF;
        END IF;

        -- short_description: 5
        IF site_record.short_description IS NOT NULL AND length(site_record.short_description) > 0 THEN
            score := score + 5;
        END IF;

        -- processed_periods: 10
        IF site_record.processed_periods IS NOT NULL AND site_record.processed_periods::text <> '{}' AND site_record.processed_periods::text <> '[]' THEN
            score := score + 10;
        END IF;

        -- processed_features: 10
        IF site_record.processed_features IS NOT NULL AND site_record.processed_features::text <> '{}' AND site_record.processed_features::text <> '[]' THEN
            score := score + 10;
        END IF;

        -- timeline entries: 10
        IF site_record.timeline IS NOT NULL AND site_record.timeline::text <> '{}' AND site_record.timeline::text <> '[]' THEN
            score := score + 10;
        END IF;

        -- FAQs: 5
        IF site_record.faqs IS NOT NULL AND site_record.faqs::text <> '{}' AND site_record.faqs::text <> '[]' THEN
            score := score + 5;
        END IF;

        -- UNESCO: 5
        IF site_record.is_unesco = TRUE THEN
            score := score + 5;
        END IF;

        -- wikipedia_url: 5
        IF site_record.wikipedia_url IS NOT NULL AND length(site_record.wikipedia_url) > 0 THEN
            score := score + 5;
        END IF;

        -- valid location: 5
        IF site_record.location IS NOT NULL THEN
            score := score + 5;
        END IF;

        -- linked Viator tours: 10
        SELECT EXISTS (
            SELECT 1 FROM viator_tours WHERE site_id = site_record.id
        ) INTO has_tours;

        IF has_tours = TRUE THEN
            score := score + 10;
        END IF;

        UPDATE sites SET featured_score = score WHERE id = site_record.id;
    END LOOP;
END;
$$;

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_fix_admin_password'),
    ]

    operations = [
        migrations.RunSQL(
            """
            -- Add source_id column if it doesn't exist
            ALTER TABLE internships
                ADD COLUMN IF NOT EXISTS source_id VARCHAR(200);

            -- Add unique constraint for ON CONFLICT (source, source_id) to work
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint
                    WHERE conname = 'internships_source_source_id_key'
                ) THEN
                    ALTER TABLE internships
                        ADD CONSTRAINT internships_source_source_id_key
                        UNIQUE (source, source_id);
                END IF;
            END $$;
            """,
            migrations.RunSQL.noop,
        ),
    ]

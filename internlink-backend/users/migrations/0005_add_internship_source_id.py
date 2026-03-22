from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_fix_admin_password'),
    ]

    operations = [
        # Add source_id column (safe to re-run)
        migrations.RunSQL(
            "ALTER TABLE internships ADD COLUMN IF NOT EXISTS source_id VARCHAR(200);",
            migrations.RunSQL.noop,
        ),
        # Add unique index for ON CONFLICT (source, source_id) to work
        # CREATE UNIQUE INDEX IF NOT EXISTS is safe to re-run
        migrations.RunSQL(
            "CREATE UNIQUE INDEX IF NOT EXISTS internships_source_source_id_idx ON internships(source, source_id);",
            migrations.RunSQL.noop,
        ),
    ]

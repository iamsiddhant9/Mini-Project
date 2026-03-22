from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_add_internship_source_id'),
    ]

    operations = [
        # applications view uses `applied_date DATE`, but migration 0003
        # created the column as `applied_at TIMESTAMPTZ`. Add the missing column.
        migrations.RunSQL(
            "ALTER TABLE applications ADD COLUMN IF NOT EXISTS applied_date DATE DEFAULT CURRENT_DATE;",
            migrations.RunSQL.noop,
        ),
        # saved_internships view uses `saved_at`, which already exists — no change.
        # Also ensure notifications table has a `type` column used by the notification engine.
        migrations.RunSQL(
            "ALTER TABLE users_notification ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'info';",
            migrations.RunSQL.noop,
        ),
    ]

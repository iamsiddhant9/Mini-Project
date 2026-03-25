from django.db import migrations

def add_metadata_column(apps, schema_editor):
    with schema_editor.connection.cursor() as cur:
        cur.execute("""
            ALTER TABLE user_activity
            ADD COLUMN IF NOT EXISTS metadata JSONB;
        """)

def remove_metadata_column(apps, schema_editor):
    with schema_editor.connection.cursor() as cur:
        cur.execute("""
            ALTER TABLE user_activity
            DROP COLUMN IF EXISTS metadata;
        """)

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0007_user_activity'),
    ]

    operations = [
        migrations.RunPython(add_metadata_column, remove_metadata_column),
    ]

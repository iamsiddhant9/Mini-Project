from django.db import migrations

def create_user_activity_table(apps, schema_editor):
    with schema_editor.connection.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS user_activity (
                id               SERIAL PRIMARY KEY,
                user_id          INTEGER REFERENCES users(id) ON DELETE CASCADE,
                event_type       VARCHAR(50) NOT NULL,
                path             VARCHAR(500),
                duration_seconds INTEGER DEFAULT 0,
                created_at       TIMESTAMPTZ DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);
        """)

def drop_user_activity_table(apps, schema_editor):
    with schema_editor.connection.cursor() as cur:
        cur.execute("DROP TABLE IF EXISTS user_activity;")

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0006_fix_applications_columns'),
    ]

    operations = [
        migrations.RunPython(create_user_activity_table, drop_user_activity_table),
    ]

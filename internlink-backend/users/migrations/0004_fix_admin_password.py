from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_create_custom_tables'),
    ]

    operations = [
        migrations.RunSQL(
            # Fix admin password hash (was SHA256("123"), should be SHA256("admin123"))
            """
            UPDATE users
            SET password_hash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
            WHERE email = 'admin@internlink.com'
              AND password_hash = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';
            """,
            migrations.RunSQL.noop,
        ),
    ]

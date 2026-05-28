"""
WSGI config for whisperwall project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os
from pathlib import Path

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whisperwall.settings')

application = get_wsgi_application()

# Wrap with WhiteNoise for static file serving (if installed)
try:
    from whitenoise import WhiteNoise
    BASE_DIR = Path(__file__).resolve().parent.parent
    STATIC_ROOT = BASE_DIR / 'staticfiles'
    application = WhiteNoise(
        application, 
        root=str(STATIC_ROOT), 
        index_file=False,
        max_age=31536000,  # 1 year cache for hashed files
        mimetypes={
            '.js': 'application/javascript; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
        }
    )
except ImportError:
    pass

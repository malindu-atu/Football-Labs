from supabase import create_client, Client
from app.config import settings

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Disable HTTP/2 to prevent "Server disconnected" errors on Python 3.12
import httpx
supabase.postgrest.session = httpx.Client(http2=False, timeout=30.0)
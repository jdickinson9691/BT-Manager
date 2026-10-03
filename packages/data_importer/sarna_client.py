import urllib.request
import urllib.parse
import json

class SarnaClient:
    """Fetches fluff and lore links from Sarna.net via public MediaWiki API."""
    
    BASE_URL = "https://www.sarna.net/wiki/api.php"
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BT-Manager/1.0"
    }

    @classmethod
    def get_mech_wiki_url(cls, chassis_name: str) -> str:
        """Generates direct URL to Sarna article for a given chassis."""
        formatted_name = urllib.parse.quote(chassis_name.replace(" ", "_"))
        return f"https://www.sarna.net/wiki/{formatted_name}"

    @classmethod
    def ping_sarna(cls, timeout: float = 3.0) -> bool:
        """Pings Sarna MediaWiki API to verify live connection status."""
        try:
            params = urllib.parse.urlencode({"action": "query", "meta": "siteinfo", "format": "json"})
            url = f"{cls.BASE_URL}?{params}"
            req = urllib.request.Request(url, headers=cls.HEADERS)
            with urllib.request.urlopen(req, timeout=timeout) as response:
                return response.status == 200
        except Exception:
            return False

    @classmethod
    def search_sarna(cls, query: str, timeout: float = 3.0) -> list:
        """Searches Sarna wiki for matching articles using live MediaWiki API."""
        params = urllib.parse.urlencode({
            "action": "opensearch",
            "search": query,
            "limit": 5,
            "format": "json"
        })
        url = f"{cls.BASE_URL}?{params}"
        
        req = urllib.request.Request(url, headers=cls.HEADERS)
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    # MediaWiki opensearch returns [query, [titles], [descriptions], [urls]]
                    if len(data) >= 4 and len(data[1]) > 0:
                        return [{"title": data[1][i], "url": data[3][i]} for i in range(len(data[1]))]
        except Exception:
            pass
        return []

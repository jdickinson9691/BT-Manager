import urllib.request
import urllib.parse
import json

class SarnaClient:
    """Fetches fluff and lore links from Sarna.net via public MediaWiki API."""
    
    BASE_URL = "https://www.sarna.net/wiki/api.php"

    @classmethod
    def get_mech_wiki_url(cls, chassis_name: str) -> str:
        """Generates direct URL to Sarna article for a given chassis."""
        formatted_name = urllib.parse.quote(chassis_name.replace(" ", "_"))
        return f"https://www.sarna.net/wiki/{formatted_name}"

    @classmethod
    def search_sarna(cls, query: str) -> list:
        """Searches Sarna wiki for matching articles."""
        params = urllib.parse.urlencode({
            "action": "opensearch",
            "search": query,
            "limit": 5,
            "format": "json"
        })
        url = f"{cls.BASE_URL}?{params}"
        
        req = urllib.request.Request(url, headers={"User-Agent": "BT-Manager/1.0"})
        try:
            with urllib.request.urlopen(req) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    # MediaWiki opensearch returns [query, [titles], [descriptions], [urls]]
                    if len(data) >= 4:
                        return [{"title": data[1][i], "url": data[3][i]} for i in range(len(data[1]))]
        except Exception:
            pass
        return []

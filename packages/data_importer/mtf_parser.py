import re

class MTFParser:
    """Parses MegaMek .mtf files into structured BattleTech Mech data."""
    
    @staticmethod
    def parse(mtf_content: str) -> dict:
        lines = [line.strip() for line in mtf_content.splitlines() if line.strip()]
        data = {
            "chassis": "",
            "model": "",
            "tech_base": "Inner Sphere",
            "era": "",
            "tonnage": 0,
            "bv2": 0,
            "cost_cbills": 0,
            "engine_type": "",
            "walking_mp": 0,
            "jumping_mp": 0,
            "armor": {},
            "components": []
        }
        
        current_section = None
        
        for line in lines:
            if line.startswith("Chassis:"):
                data["chassis"] = line.split(":", 1)[1].strip()
            elif line.startswith("Model:"):
                data["model"] = line.split(":", 1)[1].strip()
            elif line.startswith("TechBase:"):
                data["tech_base"] = line.split(":", 1)[1].strip()
            elif line.startswith("Era:"):
                data["era"] = line.split(":", 1)[1].strip()
            elif line.startswith("Mass:"):
                data["tonnage"] = int(line.split(":", 1)[1].strip())
            elif line.startswith("BV:"):
                data["bv2"] = int(line.split(":", 1)[1].strip())
            elif line.startswith("Cost:"):
                try:
                    data["cost_cbills"] = int(line.split(":", 1)[1].strip())
                except ValueError:
                    pass
            elif line.startswith("Walk MP:"):
                data["walking_mp"] = int(line.split(":", 1)[1].strip())
            elif line.startswith("Jump MP:"):
                data["jumping_mp"] = int(line.split(":", 1)[1].strip())
            elif "Armor:" in line and "Armor factor" not in line:
                parts = line.split(":")
                location = parts[0].replace("Armor", "").strip()
                try:
                    data["armor"][location] = int(parts[1].strip())
                except ValueError:
                    pass
                    
        return data

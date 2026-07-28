from packages.data_importer.mtf_parser import MTFParser

SAMPLE_MTF = """
Version:1.0
Timber Wolf (Mad Cat)
Prime

Config:Biped
TechBase:Clan
Era:3050
Rules Level:2

Mass:75
Engine:375 XL
Walk MP:5
Jump MP:0

Armor:Ferro-Fibrous
LA Armor:24
RA Armor:24
LT Armor:24
RT Armor:24
CT Armor:36
HD Armor:9
LL Armor:32
RL Armor:32

BV:2737
Cost:24263125
"""

def test_parse_sample():
    result = MTFParser.parse(SAMPLE_MTF)
    assert result["tonnage"] == 75
    assert result["bv2"] == 2737
    assert result["tech_base"] == "Clan"
    assert result["armor"]["CT"] == 36
    print("MTF Parser Unit Test Passed successfully!")

if __name__ == "__main__":
    test_parse_sample()

import customtkinter as ctk
import sqlite3
import math
import os
import random

DB_PATH = "battletech.db"

BATTLETECH_ERAS = [
    "Late Succession War - Renaissance (3020–3049)",
    "Clan Invasion (3050–3061)"
]

FACTION_COLORS = {
    "House Davion": "#FED7AA",
    "House Draconis Combine": "#F87171",
    "House Steiner": "#60A5FA",
    "House Marik": "#A78BFA",
    "House Liao": "#34D399",
    "ComStar": "#F43F5E",
    "Wolf's Dragoons": "#FB923C",
    "Independent": "#A1A1AA"
}

DEFAULT_SYSTEM_MAP = {
    "Outreach": ("Wolf's Dragoons", 0.0, 0.0, 50000),
    "Galax": ("House Davion", 18.5, -12.1, 120000),
    "Tukayyid": ("ComStar", -15.2, 22.4, 100000),
    "Solaris VII": ("Independent", 12.0, 25.5, 150000),
    "New Avalon": ("House Davion", 22.0, -15.5, 140000),
    "Luthien": ("House Draconis Combine", 28.4, -52.6, 250000)
}

ERA_SYSTEM_MAPS = {
    "Late Succession War - Renaissance (3020–3049)": DEFAULT_SYSTEM_MAP,
    "Clan Invasion (3050–3061)": {
        "Outreach": ("Wolf's Dragoons", 0.0, 0.0, 50000),
        "Galax": ("House Davion", 18.5, -12.1, 120000),
        "New Avalon": ("House Davion", 22.0, -15.5, 140000),
        "Luthien": ("House Draconis Combine", 28.4, -52.6, 250000),
        "Tukayyid": ("ComStar", -15.2, 22.4, 100000),
        "Twycross": ("Clan Jade Falcon", -55.0, 60.0, 280000)
    }
}

def get_era_systems(era_name):
    return ERA_SYSTEM_MAPS.get(era_name, DEFAULT_SYSTEM_MAP)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('CREATE TABLE IF NOT EXISTS campaign (id INTEGER PRIMARY KEY, campaign_name TEXT, start_date TEXT, current_date TEXT, treasury INTEGER, current_system TEXT, era TEXT)')
    cursor.execute('CREATE TABLE IF NOT EXISTS company (id INTEGER PRIMARY KEY, campaign_id INTEGER, company_name TEXT, commander_name TEXT, mrb_rating TEXT)')
    cursor.execute('CREATE TABLE IF NOT EXISTS roster (id INTEGER PRIMARY KEY, company_id INTEGER, mech_name TEXT, tonnage INTEGER, status TEXT, armor_status TEXT, repair_cost INTEGER)')
    cursor.execute('CREATE TABLE IF NOT EXISTS personnel (id INTEGER PRIMARY KEY, company_id INTEGER, pilot_name TEXT, rank TEXT, gunnery INTEGER, piloting INTEGER, status TEXT, salary INTEGER, xp INTEGER, spa TEXT, kills INTEGER, bondsmen INTEGER)')
    cursor.execute('CREATE TABLE IF NOT EXISTS hiring_hall (id INTEGER PRIMARY KEY, company_id INTEGER, pilot_name TEXT, rank TEXT, gunnery INTEGER, piloting INTEGER, signing_bonus INTEGER)')
    cursor.execute('CREATE TABLE IF NOT EXISTS systems (id INTEGER PRIMARY KEY, system_name TEXT, faction TEXT, jump_cost INTEGER, x_coord REAL, y_coord REAL)')
    cursor.execute('CREATE TABLE IF NOT EXISTS inventory (id INTEGER PRIMARY KEY, company_id INTEGER, part_name TEXT, category TEXT, stock INTEGER, cost INTEGER)')
    cursor.execute('CREATE TABLE IF NOT EXISTS contracts (id INTEGER PRIMARY KEY, company_id INTEGER, employer TEXT, mission_type TEXT, difficulty TEXT, payout INTEGER, salvage_rights TEXT, is_active INTEGER, enemy_faction TEXT, intel_summary TEXT)')
    conn.commit()
    conn.close()

init_db()

def get_existing_campaigns():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT c.id, c.campaign_name, co.company_name FROM campaign c LEFT JOIN company co ON co.campaign_id = c.id")
    rows = cursor.fetchall()
    conn.close()
    return rows

setup_app = ctk.CTk()
setup_app.geometry("600x600")
setup_app.title("BT-Manager - Campaign Setup Agent")
ctk.set_appearance_mode("Dark")

ctk.CTkLabel(setup_app, text="Campaign Launcher & Setup Agent", font=("Arial", 16, "bold"), text_color="#F97316").pack(pady=15)
form_frame = ctk.CTkScrollableFrame(setup_app, fg_color="#18181B", width=520, height=480)
form_frame.pack(padx=20, pady=10, fill="both", expand=True)

existing = get_existing_campaigns()
if existing:
    ctk.CTkLabel(form_frame, text="Select Existing Campaign:", font=("Arial", 12, "bold"), text_color="#38BDF8").pack(anchor="w", padx=15, pady=(10, 2))
    camp_opts = [f"ID {r[0]}: {r[1]} ({r[2] or 'Independent'})" for r in existing]
    camp_var = ctk.StringVar(value=camp_opts[0])
    ctk.CTkOptionMenu(form_frame, values=camp_opts, variable=camp_var, width=460).pack(padx=15, pady=5)
    
    def load_existing():
        cid = int(camp_var.get().split(":")[0].replace("ID ", ""))
        with open("active_campaign.txt", "w") as f: f.write(str(cid))
        setup_app.quit(); setup_app.destroy()
    ctk.CTkButton(form_frame, text="Load Campaign", command=load_existing, fg_color="#10B981").pack(pady=10)
    ctk.CTkLabel(form_frame, text="--- OR NEW CAMPAIGN ---", text_color="#71717A").pack(pady=10)

ctk.CTkLabel(form_frame, text="Campaign Name:", font=("Arial", 11)).pack(anchor="w", padx=15, pady=(5, 2))
ent_cname = ctk.CTkEntry(form_frame, width=460)
ent_cname.insert(0, "Succession Wars 3025")
ent_cname.pack(padx=15, pady=2)

ctk.CTkLabel(form_frame, text="Select Era:", font=("Arial", 11)).pack(anchor="w", padx=15, pady=(5, 2))
era_var = ctk.StringVar(value=BATTLETECH_ERAS[0])
ctk.CTkOptionMenu(form_frame, values=BATTLETECH_ERAS, variable=era_var, width=460).pack(padx=15, pady=2)

ctk.CTkLabel(form_frame, text="Company Name:", font=("Arial", 11)).pack(anchor="w", padx=15, pady=(5, 2))
ent_coname = ctk.CTkEntry(form_frame, width=460)
ent_coname.insert(0, "Wolf's Irregulars")
ent_coname.pack(padx=15, pady=2)

def create_new_campaign():
    cname = ent_cname.get()
    era = era_var.get()
    coname = ent_coname.get()
    
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("INSERT INTO campaign (campaign_name, start_date, current_date, treasury, current_system, era) VALUES (?, ?, ?, ?, ?, ?)", (cname, "3025-01-01", "3025-01-01", 15000000, "Outreach", era))
    camp_id = cur.lastrowid
    cur.execute("INSERT INTO company (campaign_id, company_name, commander_name, mrb_rating) VALUES (?, ?, ?, ?)", (camp_id, coname, "Major Jaime Wolf", "B-Draft"))
    co_id = cur.lastrowid

    sys_map = get_era_systems(era)
    for sname, sdata in sys_map.items():
        cur.execute("INSERT INTO systems (system_name, faction, jump_cost, x_coord, y_coord) VALUES (?, ?, ?, ?, ?)", (sname, sdata[0], sdata[3], sdata[1], sdata[2]))

    cur.executemany("INSERT INTO roster (company_id, mech_name, tonnage, status, armor_status, repair_cost) VALUES (?, ?, ?, ?, ?, ?)", [
        (co_id, "Shadow Hawk SHD-2H", 55, "Operational", "100%", 0),
        (co_id, "Warhammer WHM-6R", 70, "Damaged", "65%", 250000)
    ])
    cur.executemany("INSERT INTO personnel (company_id, pilot_name, rank, gunnery, piloting, status, salary, xp, spa, kills, bondsmen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
        (co_id, "Lt. Natasha Kerensky", "Lieutenant", 2, 3, "Fit for Duty", 75000, 45, "None", 2, 1),
        (co_id, "MechWarrior Robert Clay", "Sergeant", 4, 5, "In MedBay", 35000, 10, "None", 0, 0)
    ])
    cur.executemany("INSERT INTO hiring_hall (company_id, pilot_name, rank, gunnery, piloting, signing_bonus) VALUES (?, ?, ?, ?, ?, ?)", [
        (co_id, "Rana Hawkins", "Sergeant", 3, 3, 450000)
    ])
    cur.executemany("INSERT INTO inventory (company_id, part_name, category, stock, cost) VALUES (?, ?, ?, ?, ?)", [
        (co_id, "AC/20 Autocannon", "Weaponry", 2, 500000),
        (co_id, "Heat Sink", "Internal", 6, 20000)
    ])
    cur.executemany("INSERT INTO contracts (company_id, employer, mission_type, difficulty, payout, salvage_rights, is_active, enemy_faction, intel_summary) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)", [
        (co_id, "House Davion", "Garrison Duty & Patrol", "Medium", 450000, "Standard (25%)", "Draconis Combine", "Standard frontline defense mission.")
    ])
    conn.commit()
    conn.close()

    with open("active_campaign.txt", "w") as f: f.write(str(camp_id))
    setup_app.quit(); setup_app.destroy()

ctk.CTkButton(form_frame, text="Create & Launch New Campaign", command=create_new_campaign, fg_color="#F97316").pack(pady=20)
setup_app.mainloop()

# --- MAIN COMMAND DECK ---
ACTIVE_CAMP_ID = 1
if os.path.exists("active_campaign.txt"):
    try:
        with open("active_campaign.txt", "r") as f: ACTIVE_CAMP_ID = int(f.read().strip())
    except: pass

app = ctk.CTk()
app.geometry("1400x900")
app.title("BT-Manager - Modular Command Deck")
ctk.set_appearance_mode("Dark")

def fetch_campaign():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT current_date, current_system, treasury, campaign_name, era FROM campaign WHERE id = ?", (ACTIVE_CAMP_ID,))
    camp = cur.fetchone()
    cur.execute("SELECT id, company_name FROM company WHERE campaign_id = ?", (ACTIVE_CAMP_ID,))
    comp = cur.fetchone()
    conn.close()
    return camp, comp

camp_data, comp_data = fetch_campaign()
CO_ID = comp_data[0] if comp_data else 1

header = ctk.CTkFrame(app, fg_color="#18181B")
header.pack(fill="x", padx=15, pady=10)
ctk.CTkLabel(header, text=f"{camp_data[3]} [{camp_data[4]}] | {comp_data[1]}", font=("Arial", 14, "bold"), text_color="#F97316").pack(side="left", padx=10, pady=8)
lbl_treasury = ctk.CTkLabel(header, text=f"C-BILLS: ${camp_data[2]:,}", font=("Arial", 12, "bold"), text_color="#10B981")
lbl_treasury.pack(side="right", padx=15, pady=8)

tabview = ctk.CTkTabview(app, fg_color="#09090B")
tabview.pack(fill="both", expand=True, padx=15, pady=5)

tab_ops = tabview.add("Operations & Contracts")
tab_map = tabview.add("Galactic Map")
tab_maint = tabview.add("Maintenance & Engineering")
tab_inv = tabview.add("Storage & Parts Inventory")
tab_pers = tabview.add("Personnel & MedBay")

# TAB 1: OPERATIONS & CONTRACTS (Agent 2)
ctk.CTkLabel(tab_ops, text="Agent 2: Operations & Contracts Deck", font=("Arial", 14, "bold")).pack(anchor="w", padx=15, pady=5)
con_scroll = ctk.CTkScrollableFrame(tab_ops, fg_color="#18181B", width=1300, height=600)
con_scroll.pack(padx=15, pady=5, fill="both", expand=True)

def load_ops_tab():
    for w in con_scroll.winfo_children(): w.destroy()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id, employer, mission_type, difficulty, payout, salvage_rights FROM contracts WHERE company_id = ? AND is_active = 0", (CO_ID,))
    rows = cur.fetchall()
    conn.close()

    ctk.CTkLabel(con_scroll, text="Available Contract Board:", font=("Arial", 13, "bold"), text_color="#38BDF8").pack(anchor="w", padx=10, pady=5)
    for r in rows:
        card = ctk.CTkFrame(con_scroll, fg_color="#27272A")
        card.pack(fill="x", padx=10, pady=5)
        ctk.CTkLabel(card, text=f"Employer: {r[1]} | Mission: {r[2]} ({r[3]}) | Payout: ${r[4]:,} | Salvage: {r[5]}").pack(side="left", padx=10, pady=8)
        
        def accept_con(cid=r[0]):
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("UPDATE contracts SET is_active = 1 WHERE id = ?", (cid,))
            conn.commit()
            conn.close()
            load_ops_tab()
            
        ctk.CTkButton(card, text="Accept Contract", command=accept_con, fg_color="#F97316", width=120).pack(side="right", padx=10, pady=8)

load_ops_tab()

# TAB 2: GALACTIC MAP (Agent 3)
ctk.CTkLabel(tab_map, text="Agent 3: Galactic Map & Planetary Grid", font=("Arial", 14, "bold"), text_color="#38BDF8").pack(anchor="w", padx=15, pady=5)
map_canvas = ctk.CTkCanvas(tab_map, bg="#111113", highlightthickness=0)
map_canvas.pack(padx=15, pady=5, fill="both", expand=True)

def render_map(event=None):
    map_canvas.delete("all")
    w = map_canvas.winfo_width() or 1300
    h = map_canvas.winfo_height() or 600
    cx, cy = w / 2.0, h / 2.0

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT system_name, faction, x_coord, y_coord FROM systems")
    systems = cur.fetchall()
    conn.close()

    for sname, faction, sx, sy in systems:
        px = cx + (sx * 5.0)
        py = cy - (sy * 5.0)
        color = FACTION_COLORS.get(faction, "#A1A1AA")
        map_canvas.create_oval(px-6, py-6, px+6, py+6, fill=color, outline="#FFF")
        map_canvas.create_text(px, py-12, text=f"{sname} ({faction})", fill=color, font=("Arial", 9, "bold"))

map_canvas.bind("<Configure>", render_map)

# TAB 3: MAINTENANCE & ENGINEERING (Agent 4)
ctk.CTkLabel(tab_maint, text="Agent 4: Maintenance & Engineering Roster", font=("Arial", 14, "bold")).pack(anchor="w", padx=15, pady=5)
maint_scroll = ctk.CTkScrollableFrame(tab_maint, fg_color="#18181B", width=1300, height=600)
maint_scroll.pack(padx=15, pady=5, fill="both", expand=True)

def load_maint_tab():
    for w in maint_scroll.winfo_children(): w.destroy()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT mech_name, tonnage, status, armor_status FROM roster WHERE company_id = ?", (CO_ID,))
    for m in cur.fetchall():
        card = ctk.CTkFrame(maint_scroll, fg_color="#27272A")
        card.pack(fill="x", padx=10, pady=5)
        ctk.CTkLabel(card, text=f"Unit: {m[0]} | Tonnage: {m[1]}T | Status: {m[2]} | Armor: {m[3]}").pack(side="left", padx=10, pady=8)
    conn.close()

load_maint_tab()

# TAB 4: STORAGE & PARTS INVENTORY (Agent 4)
ctk.CTkLabel(tab_inv, text="Agent 4: Warehouse Storage & Spare Parts", font=("Arial", 14, "bold")).pack(anchor="w", padx=15, pady=5)
inv_scroll = ctk.CTkScrollableFrame(tab_inv, fg_color="#18181B", width=1300, height=600)
inv_scroll.pack(padx=15, pady=5, fill="both", expand=True)

def load_inv_tab():
    for w in inv_scroll.winfo_children(): w.destroy()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT part_name, category, stock, cost FROM inventory WHERE company_id = ?", (CO_ID,))
    for p in cur.fetchall():
        card = ctk.CTkFrame(inv_scroll, fg_color="#27272A")
        card.pack(fill="x", padx=10, pady=5)
        ctk.CTkLabel(card, text=f"Part: {p[0]} | Category: {p[1]} | Stock: {p[2]} Units | Cost: ${p[3]:,}").pack(side="left", padx=10, pady=8)
    conn.close()

load_inv_tab()

# TAB 5: PERSONNEL & MEDBAY (Agent 5)
ctk.CTkLabel(tab_pers, text="Agent 5: Personnel & Pilot Roster", font=("Arial", 14, "bold")).pack(anchor="w", padx=15, pady=5)
pers_scroll = ctk.CTkScrollableFrame(tab_pers, fg_color="#18181B", width=1300, height=600)
pers_scroll.pack(padx=15, pady=5, fill="both", expand=True)

def load_pers_tab():
    for w in pers_scroll.winfo_children(): w.destroy()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT pilot_name, rank, gunnery, piloting, status, salary FROM personnel WHERE company_id = ?", (CO_ID,))
    for pe in cur.fetchall():
        card = ctk.CTkFrame(pers_scroll, fg_color="#27272A")
        card.pack(fill="x", padx=10, pady=5)
        ctk.CTkLabel(card, text=f"Pilot: {pe[0]} ({pe[1]}) | G/P: {pe[2]}/{pe[3]} | Status: {pe[4]} | Salary: ${pe[5]:,}/mo").pack(side="left", padx=10, pady=8)
    conn.close()

load_pers_tab()

app.mainloop()
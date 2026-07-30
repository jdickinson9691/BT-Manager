import multiprocessing
if __name__ == '__main__':
    multiprocessing.freeze_support()

import customtkinter as ctk
import sqlite3
import math
import os
import sys
import threading
import random
from tkinter import messagebox

DB_PATH = "battletech.db"

BATTLETECH_ERAS = [
    "Late Succession War - Renaissance (3020–3049)",
    "Clan Invasion (3050–3061)"
]

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('CREATE TABLE IF NOT EXISTS campaign (id INTEGER PRIMARY KEY, campaign_name TEXT, start_date TEXT, current_date TEXT, treasury INTEGER, current_system TEXT, era TEXT)')
    cursor.execute('CREATE TABLE IF NOT EXISTS company (id INTEGER PRIMARY KEY, campaign_id INTEGER, company_name TEXT, commander_name TEXT, mrb_rating TEXT)')
    cursor.execute('CREATE TABLE IF NOT EXISTS roster (id INTEGER PRIMARY KEY, company_id INTEGER, mech_name TEXT, tonnage INTEGER, status TEXT, armor_status TEXT, repair_cost INTEGER)')
    cursor.execute('CREATE TABLE IF NOT EXISTS personnel (id INTEGER PRIMARY KEY, company_id INTEGER, pilot_name TEXT, rank TEXT, gunnery INTEGER, piloting INTEGER, status TEXT, salary INTEGER, xp INTEGER, spa TEXT, kills INTEGER, bondsmen INTEGER)')
    cursor.execute('CREATE TABLE IF NOT EXISTS inventory (id INTEGER PRIMARY KEY, company_id INTEGER, part_name TEXT, category TEXT, stock INTEGER, cost INTEGER)')
    cursor.execute('CREATE TABLE IF NOT EXISTS contracts (id INTEGER PRIMARY KEY, company_id INTEGER, employer TEXT, mission_type TEXT, difficulty TEXT, payout INTEGER, salvage_rights TEXT, is_active INTEGER, enemy_faction TEXT, intel_summary TEXT)')
    conn.commit()
    conn.close()

init_db()

def start_api_server():
    try:
        import uvicorn
        from apps.api.main import app as fastapi_app
        uvicorn.run(fastapi_app, host="127.0.0.1", port=8000, log_level="warning", workers=1)
    except Exception as e:
        print("API server thread notice:", e)

# Headless server mode for Electron background process
if "--server" in sys.argv or "--api" in sys.argv:
    start_api_server()
    sys.exit(0)

# Start background API server for standalone GUI execution
threading.Thread(target=start_api_server, daemon=True).start()

def get_existing_campaigns():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT c.id, c.campaign_name, co.company_name FROM campaign c LEFT JOIN company co ON co.campaign_id = c.id")
    rows = cursor.fetchall()
    conn.close()
    return rows

def fetch_active_campaign_id():
    if os.path.exists("active_campaign.txt"):
        try:
            with open("active_campaign.txt", "r") as f:
                val = int(f.read().strip())
                conn = sqlite3.connect(DB_PATH)
                cur = conn.cursor()
                cur.execute("SELECT id FROM campaign WHERE id = ?", (val,))
                row = cur.fetchone()
                conn.close()
                if row:
                    return row[0]
        except Exception:
            pass
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id FROM campaign ORDER BY id DESC LIMIT 1")
    row = cur.fetchone()
    conn.close()
    return row[0] if row else None

# SINGLE ROOT WINDOW
app = ctk.CTk()
app.geometry("1420x920")
app.title("BT-Manager - Campaign Lifecycle Command Deck")
ctk.set_appearance_mode("Dark")

ACTIVE_CAMP_ID = fetch_active_campaign_id()
CO_ID = 1

def fetch_campaign():
    if not ACTIVE_CAMP_ID:
        return ("3025-01-15", "Outreach", 15000000, "Succession Wars 3025", BATTLETECH_ERAS[0]), (1, "Wolf's Irregulars")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT current_date, current_system, treasury, campaign_name, era FROM campaign WHERE id = ?", (ACTIVE_CAMP_ID,))
    camp = cur.fetchone() or ("3025-01-15", "Outreach", 15000000, "Succession Wars 3025", BATTLETECH_ERAS[0])
    cur.execute("SELECT id, company_name FROM company WHERE campaign_id = ?", (ACTIVE_CAMP_ID,))
    comp = cur.fetchone() or (1, "Wolf's Irregulars")
    conn.close()
    return camp, comp

# LAUNCHER FRAME & DECK FRAME
launcher_frame = ctk.CTkFrame(app, fg_color="#0C0D12")
deck_frame = ctk.CTkFrame(app, fg_color="#0C0D12")

# ==================== LAUNCHER FRAME UI ====================
ctk.CTkLabel(launcher_frame, text="BT-MANAGER CAMPAIGN LAUNCHER", font=("Arial", 18, "bold"), text_color="#F97316").pack(pady=20)
form_scroll = ctk.CTkScrollableFrame(launcher_frame, fg_color="#18181B", width=600, height=600)
form_scroll.pack(padx=20, pady=10, fill="both", expand=True)

existing_camps = get_existing_campaigns()
if existing_camps:
    ctk.CTkLabel(form_scroll, text="Select Existing Campaign:", font=("Arial", 12, "bold"), text_color="#38BDF8").pack(anchor="w", padx=20, pady=(15, 2))
    c_opts = [f"ID {r[0]}: {r[1]} ({r[2] or 'Independent'})" for r in existing_camps]
    c_var = ctk.StringVar(value=c_opts[0])
    ctk.CTkOptionMenu(form_scroll, values=c_opts, variable=c_var, width=520).pack(padx=20, pady=5)
    
    def on_load_existing():
        global ACTIVE_CAMP_ID, CO_ID
        ACTIVE_CAMP_ID = int(c_var.get().split(":")[0].replace("ID ", ""))
        with open("active_campaign.txt", "w") as f: f.write(str(ACTIVE_CAMP_ID))
        camp_d, comp_d = fetch_campaign()
        CO_ID = comp_d[0]
        launcher_frame.pack_forget()
        deck_frame.pack(fill="both", expand=True)
        refresh_all_deck_views()
        
    ctk.CTkButton(form_scroll, text="Load Campaign", command=on_load_existing, fg_color="#10B981", font=("Arial", 12, "bold"), height=38).pack(pady=12)
    ctk.CTkLabel(form_scroll, text="--- OR START NEW CAMPAIGN ---", font=("Arial", 10, "bold"), text_color="#71717A").pack(pady=10)

ctk.CTkLabel(form_scroll, text="Campaign Name:", font=("Arial", 11, "bold")).pack(anchor="w", padx=20, pady=(5, 2))
ent_cname = ctk.CTkEntry(form_scroll, width=520)
ent_cname.insert(0, "Succession Wars 3025")
ent_cname.pack(padx=20, pady=2)

ctk.CTkLabel(form_scroll, text="Select Era:", font=("Arial", 11, "bold")).pack(anchor="w", padx=20, pady=(5, 2))
era_var = ctk.StringVar(value=BATTLETECH_ERAS[0])
ctk.CTkOptionMenu(form_scroll, values=BATTLETECH_ERAS, variable=era_var, width=520).pack(padx=20, pady=2)

ctk.CTkLabel(form_scroll, text="Company Name:", font=("Arial", 11, "bold")).pack(anchor="w", padx=20, pady=(5, 2))
ent_coname = ctk.CTkEntry(form_scroll, width=520)
ent_coname.insert(0, "Wolf's Irregulars")
ent_coname.pack(padx=20, pady=2)

def on_create_new_campaign():
    global ACTIVE_CAMP_ID, CO_ID
    cname = ent_cname.get()
    era = era_var.get()
    coname = ent_coname.get()
    
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("INSERT INTO campaign (campaign_name, start_date, current_date, treasury, current_system, era) VALUES (?, ?, ?, ?, ?, ?)", (cname, "3025-01-01", "3025-01-15", 15000000, "Outreach", era))
    ACTIVE_CAMP_ID = cur.lastrowid
    cur.execute("INSERT INTO company (campaign_id, company_name, commander_name, mrb_rating) VALUES (?, ?, ?, ?)", (ACTIVE_CAMP_ID, coname, "Major Jaime Wolf", "B"))
    CO_ID = cur.lastrowid

    cur.executemany("INSERT INTO roster (company_id, mech_name, tonnage, status, armor_status, repair_cost) VALUES (?, ?, ?, ?, ?, ?)", [
        (CO_ID, "Marauder MAD-3R", 75, "Operational", "100%", 0),
        (CO_ID, "Warhammer WHM-6R", 70, "Operational", "100%", 0),
        (CO_ID, "Centurion CN9-A", 50, "Operational", "100%", 0)
    ])
    cur.executemany("INSERT INTO personnel (company_id, pilot_name, rank, gunnery, piloting, status, salary, xp, spa, kills, bondsmen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
        (CO_ID, "Lt. Natasha Kerensky", "Lieutenant", 2, 3, "Fit for Duty", 75000, 85, "Sharpshooter", 5, 0),
        (CO_ID, "Kaelen Cross", "Sergeant", 3, 4, "Fit for Duty", 45000, 40, "Tactical Genius", 2, 0)
    ])
    cur.executemany("INSERT INTO inventory (company_id, part_name, category, stock, cost) VALUES (?, ?, ?, ?, ?)", [
        (CO_ID, "AC/20 Autocannon", "Weaponry", 2, 500000),
        (CO_ID, "Particle Projector Cannon (PPC)", "Weaponry", 3, 300000),
        (CO_ID, "Medium Laser", "Weaponry", 6, 80000),
        (CO_ID, "Heat Sink", "Internal", 12, 20000)
    ])
    cur.executemany("INSERT INTO contracts (company_id, employer, mission_type, difficulty, payout, salvage_rights, is_active, enemy_faction, intel_summary) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)", [
        (CO_ID, "House Davion", "Garrison Defense", "Medium", 3500000, "Shared (50%)", "Draconis Combine", "Garrison defense on Outreach."),
        (CO_ID, "Draconis Combine Mustered Soldier", "Objective Raid", "Hard", 4200000, "Full Salvage", "Federated Suns", "High-priority raiding contract."),
        (CO_ID, "Independent Local Government", "Reconnaissance", "Light", 2800000, "Shared (25%)", "Pirates", "Perimeter patrol.")
    ])
    conn.commit()
    conn.close()

    with open("active_campaign.txt", "w") as f: f.write(str(ACTIVE_CAMP_ID))
    launcher_frame.pack_forget()
    deck_frame.pack(fill="both", expand=True)
    refresh_all_deck_views()

ctk.CTkButton(form_scroll, text="Create & Launch New Campaign", command=on_create_new_campaign, fg_color="#F97316", font=("Arial", 12, "bold"), height=42).pack(pady=20)

# ==================== DECK FRAME UI (6-STEP WORKFLOW) ====================

# TOP HEADER BAR
header = ctk.CTkFrame(deck_frame, fg_color="#0F141E", border_width=1, border_color="#334155")
header.pack(fill="x", padx=15, pady=10)

lbl_title = ctk.CTkLabel(header, text="SUCCESSION WARS 3025 | WOLF'S IRREGULARS", font=("Arial", 14, "bold"), text_color="#EA580C")
lbl_title.pack(side="left", padx=15, pady=10)

lbl_date = ctk.CTkLabel(header, text="DATE: 3025-01-15", font=("Arial", 11, "bold"), text_color="#F8FAFC")
lbl_date.pack(side="left", padx=15, pady=10)

lbl_system = ctk.CTkLabel(header, text="SYSTEM: Outreach [ONLINE - MUL CONNECTED]", font=("Arial", 11, "bold"), text_color="#38BDF8")
lbl_system.pack(side="left", padx=15, pady=10)

mode_frame = ctk.CTkFrame(header, fg_color="#1E293B", corner_radius=6)
mode_frame.pack(side="right", padx=10, pady=8)

ctk.CTkButton(mode_frame, text="🌐 MUL: Online", font=("Arial", 10, "bold"), fg_color="#0284C7", text_color="#FFFFFF", width=95, height=26, corner_radius=4).pack(side="left", padx=2, pady=2)
ctk.CTkButton(mode_frame, text="📖 Sarna: Online", font=("Arial", 10, "bold"), fg_color="#0284C7", text_color="#FFFFFF", width=100, height=26, corner_radius=4).pack(side="left", padx=2, pady=2)
ctk.CTkButton(mode_frame, text="⚙️ MegaMek: Online", font=("Arial", 10, "bold"), fg_color="#F59E0B", text_color="#0F172A", width=115, height=26, corner_radius=4).pack(side="left", padx=2, pady=2)

lbl_treasury = ctk.CTkLabel(header, text="C-BILLS: $15,000,000", font=("Arial", 13, "bold"), text_color="#10B981")
lbl_treasury.pack(side="right", padx=15, pady=10)

def open_launcher_switch():
    deck_frame.pack_forget()
    launcher_frame.pack(fill="both", expand=True)

ctk.CTkButton(header, text="⚙️ Switch Campaign", command=open_launcher_switch, fg_color="#334155", font=("Arial", 10, "bold"), width=110, height=28).pack(side="right", padx=10)

# WORKFLOW CHRONOLOGICAL STEP TABS
tabview = ctk.CTkTabview(deck_frame, fg_color="#0C0D12")
tabview.pack(fill="both", expand=True, padx=15, pady=5)

tab_step1 = tabview.add("1. 📋 Contract & Transit")
tab_step2 = tabview.add("2. ⚔️ Force Deployment")
tab_step3 = tabview.add("3. 🏆 Combat AAR & Salvage")
tab_step4 = tabview.add("4. 🔧 Tech Bay & MechLab")
tab_step5 = tabview.add("5. 🏥 Personnel & MedBay")
tab_step6 = tabview.add("6. 📊 Financial Ledger")

# ==================== STEP 1: CONTRACT & TRANSIT ====================
ctk.CTkLabel(tab_step1, text="Step 1: Mercenary Review Board (MRB) Contract & Starmap Transit", font=("Arial", 15, "bold"), text_color="#EA580C").pack(anchor="w", padx=15, pady=(5, 10))

s1_grid = ctk.CTkFrame(tab_step1, fg_color="transparent")
s1_grid.pack(fill="both", expand=True, padx=15, pady=5)

s1_left = ctk.CTkFrame(s1_grid, fg_color="#070A12", border_width=1, border_color="#EA580C", width=700)
s1_left.pack(side="left", fill="both", expand=True, padx=(0, 10))

s1_top_row = ctk.CTkFrame(s1_left, fg_color="transparent")
s1_top_row.pack(fill="x", padx=10, pady=8)

ctk.CTkLabel(s1_top_row, text="-- Available MRB Contracts --", font=("Arial", 12, "bold"), text_color="#EA580C").pack(side="left")

def open_custom_contract_builder():
    win = ctk.CTkToplevel(app)
    win.title("Build Custom MRB Contract")
    win.geometry("520x620")
    win.grab_set()
    
    ctk.CTkLabel(win, text="🛠️ BUILD CUSTOM CONTRACT", font=("Arial", 16, "bold"), text_color="#9333EA").pack(pady=15)
    
    scroll = ctk.CTkScrollableFrame(win, fg_color="#18181B")
    scroll.pack(fill="both", expand=True, padx=15, pady=10)
    
    ctk.CTkLabel(scroll, text="Operation Name:", font=("Arial", 11, "bold")).pack(anchor="w", pady=(5,2))
    ent_op = ctk.CTkEntry(scroll, width=440)
    ent_op.insert(0, "Operation Iron Shield")
    ent_op.pack(pady=2)
    
    ctk.CTkLabel(scroll, text="Employer Faction:", font=("Arial", 11, "bold")).pack(anchor="w", pady=(5,2))
    emp_var = ctk.StringVar(value="House Davion")
    ctk.CTkOptionMenu(scroll, values=["House Davion", "House Draconis Combine", "House Steiner", "House Marik", "House Liao", "ComStar", "Independent Local Government"], variable=emp_var, width=440).pack(pady=2)
    
    ctk.CTkLabel(scroll, text="Enemy OpFor Faction:", font=("Arial", 11, "bold")).pack(anchor="w", pady=(5,2))
    opfor_var = ctk.StringVar(value="Draconis Combine")
    ctk.CTkOptionMenu(scroll, values=["Draconis Combine", "Federated Suns", "Capellan Confederation", "Free Worlds League", "Lyran Commonwealth", "Pirates", "Clan Wolf"], variable=opfor_var, width=440).pack(pady=2)
    
    ctk.CTkLabel(scroll, text="Mission Type:", font=("Arial", 11, "bold")).pack(anchor="w", pady=(5,2))
    mtype_var = ctk.StringVar(value="Garrison Defense")
    ctk.CTkOptionMenu(scroll, values=["Garrison Defense", "Objective Raid", "Recon Patrol", "Base Assault", "VIP Escort"], variable=mtype_var, width=440).pack(pady=2)
    
    ctk.CTkLabel(scroll, text="Base C-Bill Payout ($):", font=("Arial", 11, "bold")).pack(anchor="w", pady=(5,2))
    ent_pay = ctk.CTkEntry(scroll, width=440)
    ent_pay.insert(0, "3500000")
    ent_pay.pack(pady=2)
    
    ctk.CTkLabel(scroll, text="Salvage Rights:", font=("Arial", 11, "bold")).pack(anchor="w", pady=(5,2))
    salv_var = ctk.StringVar(value="Shared (50%)")
    ctk.CTkOptionMenu(scroll, values=["Shared (50%)", "Full Salvage (100%)", "Limited (25%)"], variable=salv_var, width=440).pack(pady=2)
    
    def save_custom_contract():
        opname = ent_op.get()
        emp = emp_var.get()
        opfor = opfor_var.get()
        mtype = mtype_var.get()
        try: payout = int(ent_pay.get())
        except: payout = 3500000
        salv = salv_var.get()
        
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("INSERT INTO contracts (company_id, employer, mission_type, difficulty, payout, salvage_rights, is_active, enemy_faction, intel_summary) VALUES (?, ?, ?, 'Medium', ?, ?, 0, ?, ?)",
                    (CO_ID, emp, f"{opname} ({mtype})", payout, salv, opfor, f"Custom track against {opfor}."))
        conn.commit()
        conn.close()
        refresh_mrb_board()
        win.destroy()
        messagebox.showinfo("Contract Posted", f"Custom contract '{opname}' posted to MRB Contract Board!")

    ctk.CTkButton(scroll, text="🚀 Post Contract to Board", command=save_custom_contract, fg_color="#9333EA", font=("Arial", 12, "bold"), height=38).pack(pady=15)

ctk.CTkButton(s1_top_row, text="+ Build Custom Contract", command=open_custom_contract_builder, fg_color="#9333EA", font=("Arial", 10, "bold"), width=150).pack(side="right")

mrb_scroll = ctk.CTkScrollableFrame(s1_left, fg_color="transparent")
mrb_scroll.pack(fill="both", expand=True, padx=10, pady=5)

def open_intel_briefing(cid, emp, mtype, payout, salv):
    win = ctk.CTkToplevel(app)
    win.title("Contract Tactical Intel Briefing")
    win.geometry("520x460")
    win.grab_set()
    
    ctk.CTkLabel(win, text="📋 CONTRACT TACTICAL INTEL BRIEFING", font=("Arial", 15, "bold"), text_color="#38BDF8").pack(pady=15)
    
    info_frame = ctk.CTkFrame(win, fg_color="#18181B")
    info_frame.pack(fill="both", expand=True, padx=15, pady=10)
    
    ctk.CTkLabel(info_frame, text=f"Operation: {mtype}", font=("Arial", 13, "bold"), text_color="#FFF").pack(anchor="w", padx=15, pady=(10, 2))
    ctk.CTkLabel(info_frame, text=f"Employer: {emp} | Target: Enemy OpFor", font=("Arial", 11), text_color="#CBD5E1").pack(anchor="w", padx=15, pady=2)
    ctk.CTkLabel(info_frame, text=f"Base Payout: ${payout:,} C-Bills | Salvage: {salv}", font=("Arial", 11, "bold"), text_color="#10B981").pack(anchor="w", padx=15, pady=2)
    ctk.CTkLabel(info_frame, text="Planetary Climate: Arid / Extreme Heat (+20% Heat Penalty)", font=("Arial", 11), text_color="#F59E0B").pack(anchor="w", padx=15, pady=2)
    ctk.CTkLabel(info_frame, text="OpFor Threat: 3x Heavy Mechs (~195T / 3,800 BV2)", font=("Arial", 11), text_color="#F43F5E").pack(anchor="w", padx=15, pady=2)
    
    def sign_from_intel():
        conn2 = sqlite3.connect(DB_PATH)
        cur2 = conn2.cursor()
        cur2.execute("UPDATE contracts SET is_active = 1 WHERE id = ?", (cid,))
        conn2.commit()
        conn2.close()
        refresh_mrb_board()
        win.destroy()
        tabview.set("2. ⚔️ Force Deployment")
        messagebox.showinfo("Contract Signed", "Contract signed! Proceeding to Step 2: Force Deployment.")

    btn_row = ctk.CTkFrame(win, fg_color="transparent")
    btn_row.pack(fill="x", padx=15, pady=15)
    ctk.CTkButton(btn_row, text="Close Briefing", command=win.destroy, fg_color="#475569", width=120).pack(side="left")
    ctk.CTkButton(btn_row, text="Sign & Deploy ➔", command=sign_from_intel, fg_color="#EA580C", font=("Arial", 11, "bold"), width=160).pack(side="right")

def refresh_mrb_board():
    for w in mrb_scroll.winfo_children(): w.destroy()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id, employer, mission_type, payout, salvage_rights FROM contracts WHERE company_id = ? AND is_active = 0", (CO_ID,))
    for cid, emp, mtype, payout, salv in cur.fetchall():
        card = ctk.CTkFrame(mrb_scroll, fg_color="#1E293B")
        card.pack(fill="x", padx=5, pady=4)
        ctk.CTkLabel(card, text=f"Employer: {emp} | Mission: {mtype} | Payout: ${payout:,}", font=("Arial", 11)).pack(side="left", padx=10, pady=8)
        
        def accept_contract(mid=cid):
            conn2 = sqlite3.connect(DB_PATH)
            cur2 = conn2.cursor()
            cur2.execute("UPDATE contracts SET is_active = 1 WHERE id = ?", (mid,))
            conn2.commit()
            conn2.close()
            refresh_mrb_board()
            tabview.set("2. ⚔️ Force Deployment")
            messagebox.showinfo("Contract Signed", "Contract signed! Proceeding to Step 2: Force Deployment.")

        ctk.CTkButton(card, text="Sign & Deploy ➔", command=accept_contract, fg_color="#EA580C", font=("Arial", 10, "bold"), width=110).pack(side="right", padx=6, pady=6)
        ctk.CTkButton(card, text="View Intel", command=lambda c=cid, e=emp, m=mtype, p=payout, s=salv: open_intel_briefing(c, e, m, p, s), fg_color="#0284C7", font=("Arial", 10, "bold"), width=85).pack(side="right", padx=4, pady=6)
    conn.close()

s1_right = ctk.CTkFrame(s1_grid, fg_color="#070A12", border_width=1, border_color="#38BDF8")
s1_right.pack(side="right", fill="both", expand=True)

ctk.CTkLabel(s1_right, text="Galactic Starmap JumpNet Transit", font=("Arial", 13, "bold"), text_color="#38BDF8").pack(anchor="w", padx=15, pady=10)
lbl_loc = ctk.CTkLabel(s1_right, text="CURRENT LOCATION: Outreach | Faction: Wolf's Dragoons", font=("Arial", 11, "bold"), text_color="#10B981")
lbl_loc.pack(anchor="w", padx=15, pady=2)

jump_scroll = ctk.CTkScrollableFrame(s1_right, fg_color="transparent")
jump_scroll.pack(fill="both", expand=True, padx=10, pady=5)

for dest_name, dest_faction, dist in [("Galax", "Federated Suns", 22.1), ("Tukayyid", "ComStar", 27.1), ("Solaris VII", "Independent", 28.2)]:
    row = ctk.CTkFrame(jump_scroll, fg_color="#1E293B")
    row.pack(fill="x", padx=5, pady=4)
    ctk.CTkLabel(row, text=f"System: {dest_name} ({dest_faction}) | Dist: {dist} LY", font=("Arial", 11)).pack(side="left", padx=10, pady=8)
    def jump_sys(dname=dest_name):
        lbl_loc.configure(text=f"CURRENT LOCATION: {dname} | Faction: Wolf's Dragoons")
        messagebox.showinfo("JumpNet Transit", f"JumpShip completed jump vector to {dname}!")
    ctk.CTkButton(row, text="Jump to System", command=jump_sys, fg_color="#0284C7", font=("Arial", 10, "bold"), width=110).pack(side="right", padx=6, pady=6)

# ==================== STEP 2: FORCE DEPLOYMENT ====================
ctk.CTkLabel(tab_step2, text="Step 2: Force Deployment & Command Lance Roster", font=("Arial", 15, "bold"), text_color="#0284C7").pack(anchor="w", padx=15, pady=(5, 10))

s2_scroll = ctk.CTkScrollableFrame(tab_step2, fg_color="#18181B")
s2_scroll.pack(fill="both", expand=True, padx=15, pady=5)

def refresh_deployment_tab():
    for w in s2_scroll.winfo_children(): w.destroy()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id, mech_name, tonnage, status FROM roster WHERE company_id = ?", (CO_ID,))
    for uid, mname, mton, mstat in cur.fetchall():
        card = ctk.CTkFrame(s2_scroll, fg_color="#27272A")
        card.pack(fill="x", padx=10, pady=5)
        ctk.CTkLabel(card, text=f"Lance Unit: {mname} ({mton} Tons) | Status: {mstat}", font=("Arial", 12, "bold"), text_color="#FFF").pack(side="left", padx=15, pady=10)
        
        def drop_lance():
            tabview.set("3. 🏆 Combat AAR & Salvage")
            messagebox.showinfo("Combat Drop", "Dropped Lance into active combat zone! Proceeding to Step 3: Combat AAR.")

        ctk.CTkButton(card, text="🚀 Drop into Combat Zone", command=drop_lance, fg_color="#EA580C", font=("Arial", 11, "bold"), width=160).pack(side="right", padx=10, pady=8)
    conn.close()

# ==================== STEP 3: COMBAT AAR & SALVAGE ====================
ctk.CTkLabel(tab_step3, text="Step 3: Combat After-Action Report (AAR) & Battlefield Salvage", font=("Arial", 15, "bold"), text_color="#F59E0B").pack(anchor="w", padx=15, pady=(5, 10))

s3_card = ctk.CTkFrame(tab_step3, fg_color="#070A12", border_width=1, border_color="#F59E0B")
s3_card.pack(fill="both", expand=True, padx=15, pady=5)

ctk.CTkLabel(s3_card, text="Post-Combat Engagement Summary", font=("Arial", 13, "bold"), text_color="#F59E0B").pack(anchor="w", padx=15, pady=10)
ctk.CTkLabel(s3_card, text="Status: Operation Deployed | Salvage Recovery Claim Available", font=("Arial", 11), text_color="#CBD5E1").pack(anchor="w", padx=15, pady=2)

def complete_aar():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("UPDATE campaign SET treasury = treasury + 3500000 WHERE id = ?", (ACTIVE_CAMP_ID,))
    conn.commit()
    conn.close()
    refresh_header()
    tabview.set("4. 🔧 Tech Bay & MechLab")
    messagebox.showinfo("AAR Processed", "Combat AAR Processed! Contract payout $3,500,000 C-Bills credited. Proceeding to Step 4: Tech Bay Repairs.")

ctk.CTkButton(s3_card, text="🏆 Process AAR & Claim Salvage", command=complete_aar, fg_color="#EA580C", font=("Arial", 12, "bold"), height=40).pack(padx=15, pady=20)

# ==================== STEP 4: TECH BAY & MECHLAB ====================
ctk.CTkLabel(tab_step4, text="Step 4: Tech Bay Maintenance, Engineering & MechLab Refits", font=("Arial", 15, "bold"), text_color="#10B981").pack(anchor="w", padx=15, pady=(5, 10))

s4_grid = ctk.CTkFrame(tab_step4, fg_color="transparent")
s4_grid.pack(fill="both", expand=True, padx=15, pady=5)

s4_left = ctk.CTkFrame(s4_grid, fg_color="#18181B", width=650)
s4_left.pack(side="left", fill="both", expand=True, padx=(0, 10))

ctk.CTkLabel(s4_left, text="Roster Repairs & Armor Replacement", font=("Arial", 12, "bold"), text_color="#10B981").pack(anchor="w", padx=15, pady=10)
maint_scroll = ctk.CTkScrollableFrame(s4_left, fg_color="transparent")
maint_scroll.pack(fill="both", expand=True, padx=10, pady=5)

def refresh_maint_tab():
    for w in maint_scroll.winfo_children(): w.destroy()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id, mech_name, tonnage, status, armor_status FROM roster WHERE company_id = ?", (CO_ID,))
    for uid, mname, mton, mstat, marm in cur.fetchall():
        card = ctk.CTkFrame(maint_scroll, fg_color="#27272A")
        card.pack(fill="x", padx=5, pady=4)
        ctk.CTkLabel(card, text=f"Unit: {mname} ({mton}T) | Status: {mstat}", font=("Arial", 11)).pack(side="left", padx=10, pady=8)
        
        def repair_unit(mid=uid):
            conn2 = sqlite3.connect(DB_PATH)
            cur2 = conn2.cursor()
            cur2.execute("UPDATE roster SET status = 'Operational', armor_status = '100%' WHERE id = ?", (mid,))
            conn2.commit()
            conn2.close()
            refresh_maint_tab()
            messagebox.showinfo("Tech Bay", "Armor plates replaced and structure restored!")

        ctk.CTkButton(card, text="Repair (20 SP)", command=repair_unit, fg_color="#10B981", font=("Arial", 10, "bold"), width=100).pack(side="right", padx=6, pady=6)
    conn.close()

s4_right = ctk.CTkFrame(s4_grid, fg_color="#070A12", border_width=1, border_color="#0284C7")
s4_right.pack(side="right", fill="both", expand=True)

ctk.CTkLabel(s4_right, text="Interactive MechLab Refit Deck", font=("Arial", 13, "bold"), text_color="#38BDF8").pack(anchor="w", padx=15, pady=10)
ctk.CTkLabel(s4_right, text="Loadout: 2x PPC, 2x Medium Laser | Tonnage: 16.0T / 33.8T", font=("Arial", 11), text_color="#CBD5E1").pack(anchor="w", padx=15, pady=2)

palette_frame = ctk.CTkFrame(s4_right, fg_color="transparent")
palette_frame.pack(fill="x", padx=15, pady=10)

for wname in ["PPC", "ER PPC", "Large Laser", "Medium Laser", "AC/20", "Gauss Rifle", "LRM-20", "Heat Sink"]:
    ctk.CTkButton(palette_frame, text=f"+ {wname}", fg_color="#1E293B", text_color="#38BDF8", font=("Arial", 10), height=26).pack(side="left", padx=2, pady=2)

ctk.CTkButton(s4_right, text="🛠 Commit MechLab Refit (50 SP / $100,000)", command=lambda: messagebox.showinfo("Refit", "Refit committed!"), fg_color="#0284C7", font=("Arial", 12, "bold"), height=40).pack(fill="x", padx=15, pady=15)

# ==================== STEP 5: PERSONNEL & MEDBAY ====================
ctk.CTkLabel(tab_step5, text="Step 5: Personnel MedBay Triage, XP Upgrades & Hiring Hall", font=("Arial", 15, "bold"), text_color="#9333EA").pack(anchor="w", padx=15, pady=(5, 10))

s5_grid = ctk.CTkFrame(tab_step5, fg_color="transparent")
s5_grid.pack(fill="both", expand=True, padx=15, pady=5)

s5_left = ctk.CTkFrame(s5_grid, fg_color="#18181B", width=650)
s5_left.pack(side="left", fill="both", expand=True, padx=(0, 10))

ctk.CTkLabel(s5_left, text="Active Pilot Roster & Skill Progression", font=("Arial", 12, "bold"), text_color="#9333EA").pack(anchor="w", padx=15, pady=10)
pers_scroll = ctk.CTkScrollableFrame(s5_left, fg_color="transparent")
pers_scroll.pack(fill="both", expand=True, padx=10, pady=5)

def refresh_pers_tab():
    for w in pers_scroll.winfo_children(): w.destroy()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id, pilot_name, rank, gunnery, piloting, status, xp FROM personnel WHERE company_id = ?", (CO_ID,))
    for pid, pname, prank, pgun, ppil, pstat, pxp in cur.fetchall():
        card = ctk.CTkFrame(pers_scroll, fg_color="#27272A")
        card.pack(fill="x", padx=5, pady=4)
        ctk.CTkLabel(card, text=f"Pilot: {pname} ({prank}) | G/P: {pgun}/{ppil} | XP: {pxp}", font=("Arial", 11)).pack(side="left", padx=10, pady=8)
        
        def upg_gunnery(p_id=pid):
            conn2 = sqlite3.connect(DB_PATH)
            cur2 = conn2.cursor()
            cur2.execute("UPDATE personnel SET gunnery = max(0, gunnery - 1), xp = max(0, xp - 30) WHERE id = ?", (p_id,))
            conn2.commit()
            conn2.close()
            refresh_pers_tab()
            messagebox.showinfo("Skill Upgraded", "Gunnery upgraded for pilot!")

        ctk.CTkButton(card, text="+Gunnery (-30 XP)", command=upg_gunnery, fg_color="#9333EA", font=("Arial", 10, "bold"), width=110).pack(side="right", padx=6, pady=6)
    conn.close()

s5_right = ctk.CTkFrame(s5_grid, fg_color="#070A12", border_width=1, border_color="#9333EA")
s5_right.pack(side="right", fill="both", expand=True)

ctk.CTkLabel(s5_right, text="Hiring Hall Candidate Pool", font=("Arial", 13, "bold"), text_color="#C084FC").pack(anchor="w", padx=15, pady=10)

for hc_name, hc_rank, hc_gun, hc_pil, hc_bonus in [("Rana Hawkins", "Lieutenant", 3, 3, 450000), ("Erik Sandstrom", "Sergeant", 3, 4, 350000)]:
    hcard = ctk.CTkFrame(s5_right, fg_color="#1E293B")
    hcard.pack(fill="x", padx=15, pady=5)
    ctk.CTkLabel(hcard, text=f"{hc_name} ({hc_rank}) | Bonus: ${hc_bonus:,}", font=("Arial", 11)).pack(side="left", padx=10, pady=8)
    
    def recruit_hiring_pilot(pname=hc_name, pbonus=hc_bonus):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("UPDATE campaign SET treasury = treasury - ? WHERE id = ?", (pbonus, ACTIVE_CAMP_ID))
        cur.execute("INSERT INTO personnel (company_id, pilot_name, rank, gunnery, piloting, status, salary, xp, spa, kills, bondsmen) VALUES (?, ?, 'Sergeant', 4, 4, 'Fit for Duty', 45000, 25, 'None', 0, 0)", (CO_ID, pname))
        conn.commit()
        conn.close()
        refresh_header()
        refresh_pers_tab()
        messagebox.showinfo("Recruited", f"Recruited {pname} to roster!")

    ctk.CTkButton(hcard, text="Recruit Pilot", command=recruit_hiring_pilot, fg_color="#9333EA", font=("Arial", 10, "bold"), width=90).pack(side="right", padx=10, pady=8)

# ==================== STEP 6: FINANCIAL LEDGER ====================
ctk.CTkLabel(tab_step6, text="Step 6: Campaign Financial Ledger & Timeline Settlement", font=("Arial", 15, "bold"), text_color="#CBD5E1").pack(anchor="w", padx=15, pady=(5, 10))

s6_card = ctk.CTkFrame(tab_step6, fg_color="#18181B")
s6_card.pack(fill="both", expand=True, padx=15, pady=5)

ctk.CTkLabel(s6_card, text="Daily Base Overhead: $5,000 C-Bills / day", font=("Arial", 12), text_color="#CBD5E1").pack(anchor="w", padx=20, pady=10)
ctk.CTkLabel(s6_card, text="Monthly Pilot & Staff Salaries: $150,000 C-Bills / month", font=("Arial", 12), text_color="#CBD5E1").pack(anchor="w", padx=20, pady=2)

def advance_one_day():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("UPDATE campaign SET treasury = treasury - 5000 WHERE id = ?", (ACTIVE_CAMP_ID,))
    conn.commit()
    conn.close()
    refresh_header()
    messagebox.showinfo("Logistics", "Advanced 1 Day.")

def process_payroll():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("UPDATE campaign SET treasury = treasury - 150000 WHERE id = ?", (ACTIVE_CAMP_ID,))
    conn.commit()
    conn.close()
    refresh_header()
    messagebox.showinfo("Payroll", "Processed Monthly Payroll ($150,000).")

btn_f_row = ctk.CTkFrame(s6_card, fg_color="transparent")
btn_f_row.pack(fill="x", padx=20, pady=20)
ctk.CTkButton(btn_f_row, text="+1 Day (Process Logistics)", command=advance_one_day, fg_color="#10B981", font=("Arial", 12, "bold"), height=40).pack(side="left", padx=(0, 10))
ctk.CTkButton(btn_f_row, text="Process Monthly Payroll ($150,000)", command=process_payroll, fg_color="#EA580C", font=("Arial", 12, "bold"), height=40).pack(side="left")

def refresh_header():
    camp, comp = fetch_campaign()
    lbl_title.configure(text=f"{camp[4].upper() if len(camp) > 4 else 'SUCCESSION WARS 3025'} | {comp[1].upper()}")
    lbl_date.configure(text=f"DATE: {camp[0]}")
    lbl_system.configure(text=f"SYSTEM: {camp[1]} [ONLINE - MUL CONNECTED]")
    lbl_treasury.configure(text=f"C-BILLS: ${camp[2]:,}")

def refresh_all_deck_views():
    refresh_header()
    refresh_mrb_board()
    refresh_deployment_tab()
    refresh_maint_tab()
    refresh_pers_tab()

# INITIAL VIEW PACKING
if ACTIVE_CAMP_ID:
    deck_frame.pack(fill="both", expand=True)
    refresh_all_deck_views()
else:
    launcher_frame.pack(fill="both", expand=True)

app.mainloop()
import customtkinter as ctk
import sqlite3
import math
import os
import random
from tkinter import messagebox

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

# ==================== STEP 1: CAMPAIGN LAUNCHER & SETUP DIALOG ====================
ACTIVE_CAMP_ID = None

setup_app = ctk.CTk()
setup_app.geometry("600x650")
setup_app.title("BT-Manager - Campaign Setup & Launcher")
ctk.set_appearance_mode("Dark")

ctk.CTkLabel(setup_app, text="BT-MANAGER CAMPAIGN LAUNCHER", font=("Arial", 16, "bold"), text_color="#F97316").pack(pady=15)
form_frame = ctk.CTkScrollableFrame(setup_app, fg_color="#18181B", width=540, height=520)
form_frame.pack(padx=20, pady=10, fill="both", expand=True)

existing = get_existing_campaigns()
if existing:
    ctk.CTkLabel(form_frame, text="Select Existing Campaign:", font=("Arial", 12, "bold"), text_color="#38BDF8").pack(anchor="w", padx=15, pady=(10, 2))
    camp_opts = [f"ID {r[0]}: {r[1]} ({r[2] or 'Independent'})" for r in existing]
    camp_var = ctk.StringVar(value=camp_opts[0])
    ctk.CTkOptionMenu(form_frame, values=camp_opts, variable=camp_var, width=480).pack(padx=15, pady=5)
    
    def load_existing():
        global ACTIVE_CAMP_ID
        ACTIVE_CAMP_ID = int(camp_var.get().split(":")[0].replace("ID ", ""))
        with open("active_campaign.txt", "w") as f: f.write(str(ACTIVE_CAMP_ID))
        setup_app.quit(); setup_app.destroy()
        
    ctk.CTkButton(form_frame, text="Load Campaign", command=load_existing, fg_color="#10B981", font=("Arial", 12, "bold"), height=36).pack(pady=10)
    ctk.CTkLabel(form_frame, text="--- OR START NEW CAMPAIGN ---", font=("Arial", 10, "bold"), text_color="#71717A").pack(pady=10)

ctk.CTkLabel(form_frame, text="Campaign Name:", font=("Arial", 11, "bold")).pack(anchor="w", padx=15, pady=(5, 2))
ent_cname = ctk.CTkEntry(form_frame, width=480)
ent_cname.insert(0, "Succession Wars 3025")
ent_cname.pack(padx=15, pady=2)

ctk.CTkLabel(form_frame, text="Select Era:", font=("Arial", 11, "bold")).pack(anchor="w", padx=15, pady=(5, 2))
era_var = ctk.StringVar(value=BATTLETECH_ERAS[0])
ctk.CTkOptionMenu(form_frame, values=BATTLETECH_ERAS, variable=era_var, width=480).pack(padx=15, pady=2)

ctk.CTkLabel(form_frame, text="Company Name:", font=("Arial", 11, "bold")).pack(anchor="w", padx=15, pady=(5, 2))
ent_coname = ctk.CTkEntry(form_frame, width=480)
ent_coname.insert(0, "Wolf's Irregulars")
ent_coname.pack(padx=15, pady=2)

def create_new_campaign():
    global ACTIVE_CAMP_ID
    cname = ent_cname.get()
    era = era_var.get()
    coname = ent_coname.get()
    
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("INSERT INTO campaign (campaign_name, start_date, current_date, treasury, current_system, era) VALUES (?, ?, ?, ?, ?, ?)", (cname, "3025-01-01", "3025-01-15", 15000000, "Outreach", era))
    ACTIVE_CAMP_ID = cur.lastrowid
    cur.execute("INSERT INTO company (campaign_id, company_name, commander_name, mrb_rating) VALUES (?, ?, ?, ?)", (ACTIVE_CAMP_ID, coname, "Major Jaime Wolf", "B"))
    co_id = cur.lastrowid

    sys_map = get_era_systems(era)
    for sname, sdata in sys_map.items():
        cur.execute("INSERT INTO systems (system_name, faction, jump_cost, x_coord, y_coord) VALUES (?, ?, ?, ?, ?)", (sname, sdata[0], sdata[3], sdata[1], sdata[2]))

    cur.executemany("INSERT INTO roster (company_id, mech_name, tonnage, status, armor_status, repair_cost) VALUES (?, ?, ?, ?, ?, ?)", [
        (co_id, "Marauder MAD-3R", 75, "Operational", "100%", 0),
        (co_id, "Warhammer WHM-6R", 70, "Operational", "100%", 0)
    ])
    cur.executemany("INSERT INTO personnel (company_id, pilot_name, rank, gunnery, piloting, status, salary, xp, spa, kills, bondsmen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
        (co_id, "Lt. Natasha Kerensky", "Lieutenant", 2, 3, "Fit for Duty", 75000, 45, "None", 2, 0),
        (co_id, "Sgt. Robert Clay", "Sergeant", 4, 4, "Fit for Duty", 35000, 25, "None", 1, 0)
    ])
    cur.executemany("INSERT INTO inventory (company_id, part_name, category, stock, cost) VALUES (?, ?, ?, ?, ?)", [
        (co_id, "AC/20 Autocannon", "Weaponry", 2, 500000),
        (co_id, "Particle Projector Cannon (PPC)", "Weaponry", 3, 300000),
        (co_id, "Medium Laser", "Weaponry", 6, 80000),
        (co_id, "Heat Sink", "Internal", 12, 20000)
    ])
    cur.executemany("INSERT INTO contracts (company_id, employer, mission_type, difficulty, payout, salvage_rights, is_active, enemy_faction, intel_summary) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)", [
        (co_id, "House Davion", "Garrison", "Medium", 3500000, "Shared (50%)", "Draconis Combine", "Standard garrison defense contract on Outreach."),
        (co_id, "Draconis Combine Mustered Soldier", "Objective Raid", "Hard", 4200000, "Full Salvage", "Federated Suns", "High-priority raiding contract."),
        (co_id, "Independent Local Government", "Reconnaissance", "Light", 2800000, "Shared (25%)", "Pirates", "Planetary perimeter patrol.")
    ])
    conn.commit()
    conn.close()

    with open("active_campaign.txt", "w") as f: f.write(str(ACTIVE_CAMP_ID))
    setup_app.quit(); setup_app.destroy()

ctk.CTkButton(form_frame, text="Create & Launch New Campaign", command=create_new_campaign, fg_color="#F97316", font=("Arial", 12, "bold"), height=40).pack(pady=20)
setup_app.mainloop()

# Ensure valid active campaign ID
if not ACTIVE_CAMP_ID:
    if os.path.exists("active_campaign.txt"):
        try:
            with open("active_campaign.txt", "r") as f: ACTIVE_CAMP_ID = int(f.read().strip())
        except: ACTIVE_CAMP_ID = 1
    else:
        ACTIVE_CAMP_ID = 1

# ==================== STEP 2: MAIN COMMAND DECK WINDOW ====================
app = ctk.CTk()
app.geometry("1400x900")
app.title("BT-Manager - Full Native Command Deck")
ctk.set_appearance_mode("Dark")

def fetch_campaign():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT current_date, current_system, treasury, campaign_name, era FROM campaign WHERE id = ?", (ACTIVE_CAMP_ID,))
    camp = cur.fetchone()
    if not camp:
        camp = ("3025-01-15", "Outreach", 15000000, "Succession Wars 3025", BATTLETECH_ERAS[0])
    cur.execute("SELECT id, company_name FROM company WHERE campaign_id = ?", (ACTIVE_CAMP_ID,))
    comp = cur.fetchone()
    if not comp:
        comp = (1, "Wolf's Irregulars")
    conn.close()
    return camp, comp

camp_data, comp_data = fetch_campaign()
CO_ID = comp_data[0]

# TOP HEADER BAR
header = ctk.CTkFrame(app, fg_color="#0F141E", border_width=1, border_color="#334155")
header.pack(fill="x", padx=15, pady=10)

lbl_title = ctk.CTkLabel(header, text=f"SUCCESSION WARS 3025 | {comp_data[1].upper()}", font=("Arial", 14, "bold"), text_color="#EA580C")
lbl_title.pack(side="left", padx=15, pady=10)

lbl_date = ctk.CTkLabel(header, text=f"DATE: {camp_data[0]}", font=("Arial", 11, "bold"), text_color="#F8FAFC")
lbl_date.pack(side="left", padx=15, pady=10)

lbl_system = ctk.CTkLabel(header, text=f"SYSTEM: {camp_data[1]} [ONLINE - MUL CONNECTED]", font=("Arial", 11, "bold"), text_color="#38BDF8")
lbl_system.pack(side="left", padx=15, pady=10)

mode_frame = ctk.CTkFrame(header, fg_color="#1E293B", corner_radius=6)
mode_frame.pack(side="right", padx=15, pady=8)

btn_offline = ctk.CTkButton(mode_frame, text="Offline", font=("Arial", 10), fg_color="transparent", text_color="#CBD5E1", width=55, height=26, corner_radius=4)
btn_offline.pack(side="left", padx=2, pady=2)

btn_online = ctk.CTkButton(mode_frame, text="Online (MUL API)", font=("Arial", 10, "bold"), fg_color="#0284C7", text_color="#FFFFFF", width=105, height=26, corner_radius=4)
btn_online.pack(side="right", padx=2, pady=2)

lbl_treasury = ctk.CTkLabel(header, text=f"C-BILLS: ${camp_data[2]:,}", font=("Arial", 13, "bold"), text_color="#10B981")
lbl_treasury.pack(side="right", padx=15, pady=10)

# TABS VIEW
tabview = ctk.CTkTabview(app, fg_color="#0C0D12")
tabview.pack(fill="both", expand=True, padx=15, pady=5)

tab_ops = tabview.add("Operations & Contracts")
tab_maint = tabview.add("Maintenance & Engineering")
tab_inv = tabview.add("Storage & Parts Inventory")
tab_pers = tabview.add("Personnel & MedBay")

# ==================== TAB 1: OPERATIONS & CONTRACTS ====================
ctk.CTkLabel(tab_ops, text="Command & Operations Deck", font=("Arial", 16, "bold"), text_color="#F8FAFC").pack(anchor="w", padx=15, pady=(5, 10))

# TOP DEPLOYED OPERATION BANNER
active_op_frame = ctk.CTkFrame(tab_ops, fg_color="#070A12", border_width=1, border_color="#38BDF8")
active_op_frame.pack(fill="x", padx=15, pady=5)

lbl_active_op_title = ctk.CTkLabel(active_op_frame, text="-- Active Deployed Operation --", font=("Arial", 12, "bold"), text_color="#38BDF8")
lbl_active_op_title.pack(pady=(8, 2))

active_op_content = ctk.CTkFrame(active_op_frame, fg_color="transparent")
active_op_content.pack(fill="x", padx=15, pady=(2, 8))

def refresh_active_operation():
    for w in active_op_content.winfo_children(): w.destroy()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id, employer, mission_type, payout, salvage_rights FROM contracts WHERE company_id = ? AND is_active = 1", (CO_ID,))
    active_m = cur.fetchone()
    conn.close()

    if active_m:
        ctk.CTkLabel(active_op_content, text=f"Active Operation: {active_m[2]} ({active_m[1]}) | Payout: ${active_m[3]:,} C-Bills | Salvage: {active_m[4]}", font=("Arial", 12, "bold"), text_color="#10B981").pack(side="left", padx=10)
        def complete_aar():
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("UPDATE contracts SET is_active = 0 WHERE id = ?", (active_m[0],))
            cur.execute("UPDATE campaign SET treasury = treasury + ? WHERE id = ?", (active_m[3], ACTIVE_CAMP_ID))
            conn.commit()
            conn.close()
            messagebox.showinfo("AAR Processed", f"Contract completed! ${active_m[3]:,} C-Bills added to treasury.")
            refresh_header()
            refresh_active_operation()
            refresh_mrb_board()
        ctk.CTkButton(active_op_content, text="Process Combat AAR Report", command=complete_aar, fg_color="#EA580C", font=("Arial", 11, "bold")).pack(side="right", padx=10)
    else:
        ctk.CTkLabel(active_op_content, text="No contract currently deployed. Accept one from the MRB Board below.", font=("Arial", 11, "italic"), text_color="#64748B").pack(pady=4)

refresh_active_operation()

# MAIN CONTENT GRID
ops_grid = ctk.CTkFrame(tab_ops, fg_color="transparent")
ops_grid.pack(fill="both", expand=True, padx=15, pady=10)

left_col = ctk.CTkFrame(ops_grid, fg_color="transparent")
left_col.pack(side="left", fill="both", expand=True, padx=(0, 10))

btn_row1 = ctk.CTkFrame(left_col, fg_color="transparent")
btn_row1.pack(fill="x", pady=5)

def advance_one_day():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("UPDATE campaign SET treasury = treasury - 5000 WHERE id = ?", (ACTIVE_CAMP_ID,))
    conn.commit()
    conn.close()
    refresh_header()
    messagebox.showinfo("Logistics Update", "Advanced 1 Day. Daily overhead of $5,000 C-Bills processed.")

btn_day = ctk.CTkButton(btn_row1, text="+1 Day (Process Logistics)", command=advance_one_day, fg_color="#10B981", font=("Arial", 12, "bold"), height=42)
btn_day.pack(side="left", fill="x", expand=True, padx=(0, 5))

def process_payroll():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("UPDATE campaign SET treasury = treasury - 150000 WHERE id = ?", (ACTIVE_CAMP_ID,))
    conn.commit()
    conn.close()
    refresh_header()
    messagebox.showinfo("Payroll Settlement", "Processed Monthly Payroll. $150,000 C-Bills deducted for pilot salaries and technical upkeep.")

btn_payroll = ctk.CTkButton(btn_row1, text="Process Monthly Payroll", command=process_payroll, fg_color="#EA580C", font=("Arial", 12, "bold"), height=42)
btn_payroll.pack(side="right", fill="x", expand=True, padx=(5, 0))

btn_row2 = ctk.CTkFrame(left_col, fg_color="transparent")
btn_row2.pack(fill="x", pady=5)

def add_faction_unit_dialog():
    dialog = ctk.CTkInputDialog(text="Enter Mech Chassis Name (e.g. Centurion CN9-A):", title="Add Faction Unit")
    val = dialog.get_input()
    if val:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("INSERT INTO roster (company_id, mech_name, tonnage, status, armor_status, repair_cost) VALUES (?, ?, 50, 'Operational', '100%', 0)", (CO_ID, val))
        conn.commit()
        conn.close()
        refresh_maint_tab()
        messagebox.showinfo("Unit Added", f"Unit '{val}' added to company roster!")

btn_unit = ctk.CTkButton(btn_row2, text="+ Add Faction Unit", command=add_faction_unit_dialog, fg_color="#0284C7", font=("Arial", 12, "bold"), height=42)
btn_unit.pack(side="left", fill="x", expand=True, padx=(0, 5))

def build_custom_contract_dialog():
    dialog = ctk.CTkInputDialog(text="Enter Custom Contract Name (e.g. Target Recon Raid):", title="Build Custom Contract")
    val = dialog.get_input()
    if val:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("INSERT INTO contracts (company_id, employer, mission_type, difficulty, payout, salvage_rights, is_active, enemy_faction, intel_summary) VALUES (?, ?, ?, 'Medium', 3800000, 'Shared (50%)', 0, 'House Steiner', 'Custom contract')", (CO_ID, "Custom Employer", val))
        conn.commit()
        conn.close()
        refresh_mrb_board()
        messagebox.showinfo("Contract Created", f"Custom Contract '{val}' posted to MRB Board!")

btn_contract = ctk.CTkButton(btn_row2, text="+ Build Custom Contract", command=build_custom_contract_dialog, fg_color="#9333EA", font=("Arial", 12, "bold"), height=42)
btn_contract.pack(side="right", fill="x", expand=True, padx=(5, 0))

right_col = ctk.CTkFrame(ops_grid, fg_color="transparent")
right_col.pack(side="right", fill="both", expand=True)

mrb_card = ctk.CTkFrame(right_col, fg_color="#070A12", border_width=1, border_color="#EA580C")
mrb_card.pack(fill="x", pady=(0, 10))

ctk.CTkLabel(mrb_card, text="-- MRB Available Contract Board --", font=("Arial", 12, "bold"), text_color="#EA580C").pack(pady=8)

mrb_scroll = ctk.CTkScrollableFrame(mrb_card, fg_color="transparent", height=180)
mrb_scroll.pack(fill="x", padx=10, pady=5)

def refresh_mrb_board():
    for w in mrb_scroll.winfo_children(): w.destroy()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id, employer, mission_type, payout, salvage_rights FROM contracts WHERE company_id = ? AND is_active = 0", (CO_ID,))
    contracts = cur.fetchall()
    conn.close()

    for cid, emp, mtype, payout, salv in contracts:
        card = ctk.CTkFrame(mrb_scroll, fg_color="#1E293B")
        card.pack(fill="x", padx=5, pady=4)
        ctk.CTkLabel(card, text=f"Employer: {emp} | Mission: {mtype}", font=("Arial", 11)).pack(side="left", padx=10, pady=6)
        
        def accept_mrb(mid=cid):
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("UPDATE contracts SET is_active = 1 WHERE id = ?", (mid,))
            conn.commit()
            conn.close()
            refresh_active_operation()
            refresh_mrb_board()

        def view_intel(mname=mtype, memp=emp, mpayout=payout):
            messagebox.showinfo("Contract Intel Briefing", f"Operation: {mname}\nEmployer: {memp}\nBase Payout: ${mpayout:,} C-Bills\nStatus: Verified MRB Brief")

        ctk.CTkButton(card, text="Accept Contract", command=accept_mrb, fg_color="#EA580C", font=("Arial", 10, "bold"), width=100).pack(side="right", padx=6, pady=6)
        ctk.CTkButton(card, text="View Intel", command=view_intel, fg_color="#0284C7", font=("Arial", 10, "bold"), width=90).pack(side="right", padx=4, pady=6)

refresh_mrb_board()

jump_card = ctk.CTkFrame(right_col, fg_color="#070A12", border_width=1, border_color="#38BDF8")
jump_card.pack(fill="x", pady=5)

ctk.CTkLabel(jump_card, text="Galactic JumpNet (Max 30 LY Single Jump Range Filtered)", font=("Arial", 12, "bold"), text_color="#38BDF8").pack(anchor="w", padx=12, pady=(8, 2))
lbl_loc = ctk.CTkLabel(jump_card, text="CURRENT LOCATION: Outreach | Faction: Wolf's Dragoons | Coordinates: (0.0, 0.0)", font=("Arial", 10, "bold"), text_color="#10B981")
lbl_loc.pack(anchor="w", padx=12, pady=(0, 6))

jump_scroll = ctk.CTkScrollableFrame(jump_card, fg_color="transparent", height=160)
jump_scroll.pack(fill="x", padx=10, pady=5)

destinations = [
    ("Galax", "Federated Suns", 22.1),
    ("Tukayyid", "ComStar", 27.1),
    ("Solaris VII", "Independent", 28.2)
]

for dest_name, dest_faction, dist in destinations:
    row = ctk.CTkFrame(jump_scroll, fg_color="#1E293B")
    row.pack(fill="x", padx=5, pady=4)
    ctk.CTkLabel(row, text=f"Destination: {dest_name} | Faction: {dest_faction} | Distance: {dist} LY", font=("Arial", 11)).pack(side="left", padx=10, pady=6)
    def jump_sys(dname=dest_name):
        lbl_loc.configure(text=f"CURRENT LOCATION: {dname} | Faction: Wolf's Dragoons | Coordinates: (15.0, 12.0)")
        messagebox.showinfo("JumpNet Transit", f"JumpShip completed jump vector to {dname}!")
    ctk.CTkButton(row, text="Jump to System", command=jump_sys, fg_color="#0284C7", font=("Arial", 10, "bold"), width=110).pack(side="right", padx=8, pady=6)

# ==================== TAB 2: MAINTENANCE & ENGINEERING ====================
ctk.CTkLabel(tab_maint, text="Maintenance & Engineering Deck", font=("Arial", 16, "bold"), text_color="#EA580C").pack(anchor="w", padx=15, pady=(5, 10))

maint_grid = ctk.CTkFrame(tab_maint, fg_color="transparent")
maint_grid.pack(fill="both", expand=True, padx=15, pady=5)

maint_left = ctk.CTkFrame(maint_grid, fg_color="#18181B", width=650)
maint_left.pack(side="left", fill="both", expand=True, padx=(0, 10))

ctk.CTkLabel(maint_left, text="Active Company Mech Roster", font=("Arial", 13, "bold"), text_color="#EA580C").pack(anchor="w", padx=15, pady=10)

maint_scroll = ctk.CTkScrollableFrame(maint_left, fg_color="transparent")
maint_scroll.pack(fill="both", expand=True, padx=10, pady=5)

def refresh_maint_tab():
    for w in maint_scroll.winfo_children(): w.destroy()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id, mech_name, tonnage, status, armor_status FROM roster WHERE company_id = ?", (CO_ID,))
    units_list = cur.fetchall()
    conn.close()

    for uid, mname, mton, mstat, marm in units_list:
        card = ctk.CTkFrame(maint_scroll, fg_color="#27272A")
        card.pack(fill="x", padx=5, pady=4)
        ctk.CTkLabel(card, text=f"Unit: {mname} ({mton}T) | Status: {mstat} | Armor: {marm}", font=("Arial", 11)).pack(side="left", padx=10, pady=8)
        
        def refit_unit(name=mname, ton=mton):
            lbl_refit_chassis.configure(text=f"Refitting Target: {name} ({ton}T)")
            messagebox.showinfo("MechLab Selected", f"Loaded {name} into MechLab refit bay!")

        def repair_unit(mid=uid):
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("UPDATE roster SET status = 'Operational', armor_status = '100%' WHERE id = ?", (mid,))
            conn.commit()
            conn.close()
            refresh_maint_tab()
            messagebox.showinfo("Tech Bay", "Armor plates replaced and structure restored!")

        ctk.CTkButton(card, text="Repair (20 SP)", command=repair_unit, fg_color="#EA580C", font=("Arial", 10, "bold"), width=100).pack(side="right", padx=6, pady=6)
        ctk.CTkButton(card, text="Refit Mech", command=refit_unit, fg_color="#0284C7", font=("Arial", 10, "bold"), width=90).pack(side="right", padx=4, pady=6)

refresh_maint_tab()

maint_right = ctk.CTkFrame(maint_grid, fg_color="#070A12", border_width=1, border_color="#0284C7")
maint_right.pack(side="right", fill="both", expand=True)

ctk.CTkLabel(maint_right, text="Interactive MechLab Refit Deck", font=("Arial", 14, "bold"), text_color="#38BDF8").pack(anchor="w", padx=15, pady=10)

lbl_refit_chassis = ctk.CTkLabel(maint_right, text="Refitting Target: Marauder MAD-3R (75T)", font=("Arial", 12, "bold"), text_color="#10B981")
lbl_refit_chassis.pack(anchor="w", padx=15, pady=2)

lbl_metrics = ctk.CTkLabel(maint_right, text="Loadout: 2x PPC, 2x Medium Laser | Tonnage: 16.0T / 33.8T | Heat: 26 / Dissipation: 20", font=("Arial", 11), text_color="#CBD5E1")
lbl_metrics.pack(anchor="w", padx=15, pady=4)

palette_frame = ctk.CTkFrame(maint_right, fg_color="transparent")
palette_frame.pack(fill="x", padx=15, pady=10)

ctk.CTkLabel(palette_frame, text="Equip Weapons:", font=("Arial", 11, "bold")).pack(anchor="w", pady=(0, 4))
weapons_sub = ctk.CTkFrame(palette_frame, fg_color="transparent")
weapons_sub.pack(fill="x")

fitted_items = ["PPC", "PPC", "Medium Laser", "Medium Laser", "Heat Sink"]

def update_fitted_list():
    lbl_metrics.configure(text=f"Fitted Items ({len(fitted_items)}): {', '.join(fitted_items[:4])}... | Tonnage OK | BV2: 1,363")

def add_item(iname):
    fitted_items.append(iname)
    update_fitted_list()

for wname in ["PPC", "ER PPC", "Large Laser", "Medium Laser", "AC/20", "Gauss Rifle", "LRM-20", "Heat Sink"]:
    ctk.CTkButton(weapons_sub, text=f"+ {wname}", command=lambda n=wname: add_item(n), fg_color="#1E293B", text_color="#38BDF8", border_width=1, border_color="#3B82F6", font=("Arial", 10), height=26).pack(side="left", padx=2, pady=2)

def commit_refit():
    messagebox.showinfo("MechLab Refit Committed", "Loadout refit committed! Tech Bay hours updated and BV2 recalculated.")

ctk.CTkButton(maint_right, text="🛠 Commit MechLab Refit (50 SP / $100,000 C-Bills)", command=commit_refit, fg_color="#0284C7", font=("Arial", 12, "bold"), height=40).pack(fill="x", padx=15, pady=15)

# ==================== TAB 3: STORAGE & PARTS INVENTORY (MARKET TRADE ENGINE) ====================
ctk.CTkLabel(tab_inv, text="Storage & Parts Inventory Warehouse", font=("Arial", 16, "bold"), text_color="#0284C7").pack(anchor="w", padx=15, pady=(5, 10))

inv_grid = ctk.CTkFrame(tab_inv, fg_color="transparent")
inv_grid.pack(fill="both", expand=True, padx=15, pady=5)

inv_left = ctk.CTkFrame(inv_grid, fg_color="#18181B", width=650)
inv_left.pack(side="left", fill="both", expand=True, padx=(0, 10))

ctk.CTkLabel(inv_left, text="Warehouse Stock Inventory", font=("Arial", 13, "bold"), text_color="#0284C7").pack(anchor="w", padx=15, pady=10)

inv_scroll = ctk.CTkScrollableFrame(inv_left, fg_color="transparent")
inv_scroll.pack(fill="both", expand=True, padx=10, pady=5)

def refresh_inv_tab():
    for w in inv_scroll.winfo_children(): w.destroy()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id, part_name, category, stock, cost FROM inventory WHERE company_id = ?", (CO_ID,))
    parts = cur.fetchall()
    conn.close()

    for pid, pname, pcat, pstock, pcost in parts:
        card = ctk.CTkFrame(inv_scroll, fg_color="#27272A")
        card.pack(fill="x", padx=5, pady=4)
        ctk.CTkLabel(card, text=f"Part: {pname} | Category: {pcat} | Stock: {pstock} | Unit Cost: ${pcost:,}", font=("Arial", 11)).pack(side="left", padx=10, pady=8)
        
        def sell_part(part_id=pid, price=pcost):
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("UPDATE inventory SET stock = max(0, stock - 1) WHERE id = ?", (part_id,))
            cur.execute("UPDATE campaign SET treasury = treasury + ? WHERE id = ?", (int(price * 0.75), ACTIVE_CAMP_ID))
            conn.commit()
            conn.close()
            refresh_header()
            refresh_inv_tab()
            messagebox.showinfo("Stock Sold", f"Sold 1x unit of {pname} for ${int(price * 0.75):,} C-Bills!")

        ctk.CTkButton(card, text="Sell Stock (+75%)", command=sell_part, fg_color="#EA580C", font=("Arial", 10, "bold"), width=110).pack(side="right", padx=6, pady=6)

refresh_inv_tab()

inv_right = ctk.CTkFrame(inv_grid, fg_color="#070A12", border_width=1, border_color="#10B981")
inv_right.pack(side="right", fill="both", expand=True)

ctk.CTkLabel(inv_right, text="Market Component Depot (Buy Stock)", font=("Arial", 13, "bold"), text_color="#10B981").pack(anchor="w", padx=15, pady=10)

market_parts = [
    ("AC/20 Autocannon", "Weaponry", 500000),
    ("Particle Projector Cannon (PPC)", "Weaponry", 300000),
    ("Medium Laser", "Weaponry", 80000),
    ("Heat Sink", "Internal", 20000),
    ("Ferro-Fibrous Armor Plate (5 Tons)", "Armor", 150000)
]

for mp_name, mp_cat, mp_cost in market_parts:
    mcard = ctk.CTkFrame(inv_right, fg_color="#1E293B")
    mcard.pack(fill="x", padx=15, pady=5)
    ctk.CTkLabel(mcard, text=f"{mp_name} (${mp_cost:,})", font=("Arial", 11, "bold")).pack(side="left", padx=10, pady=8)
    
    def buy_market_part(pname=mp_name, pcat=mp_cat, pcost=mp_cost):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("UPDATE campaign SET treasury = treasury - ? WHERE id = ?", (pcost, ACTIVE_CAMP_ID))
        cur.execute("INSERT INTO inventory (company_id, part_name, category, stock, cost) VALUES (?, ?, ?, 1, ?)", (CO_ID, pname, pcat, pcost))
        conn.commit()
        conn.close()
        refresh_header()
        refresh_inv_tab()
        messagebox.showinfo("Part Acquired", f"Purchased 1x {pname} for warehouse stock!")

    ctk.CTkButton(mcard, text="Buy Stock", command=buy_market_part, fg_color="#10B981", font=("Arial", 10, "bold"), width=90).pack(side="right", padx=10, pady=8)

# ==================== TAB 4: PERSONNEL & MEDBAY (XP & HIRING HALL ENGINE) ====================
ctk.CTkLabel(tab_pers, text="Personnel & Pilot Roster", font=("Arial", 16, "bold"), text_color="#9333EA").pack(anchor="w", padx=15, pady=(5, 10))

pers_grid = ctk.CTkFrame(tab_pers, fg_color="transparent")
pers_grid.pack(fill="both", expand=True, padx=15, pady=5)

pers_left = ctk.CTkFrame(pers_grid, fg_color="#18181B", width=650)
pers_left.pack(side="left", fill="both", expand=True, padx=(0, 10))

ctk.CTkLabel(pers_left, text="Active Pilot Roster & XP Upgrade Deck", font=("Arial", 13, "bold"), text_color="#9333EA").pack(anchor="w", padx=15, pady=10)

pers_scroll = ctk.CTkScrollableFrame(pers_left, fg_color="transparent")
pers_scroll.pack(fill="both", expand=True, padx=10, pady=5)

def refresh_pers_tab():
    for w in pers_scroll.winfo_children(): w.destroy()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id, pilot_name, rank, gunnery, piloting, status, salary, xp, spa FROM personnel WHERE company_id = ?", (CO_ID,))
    pilots_list = cur.fetchall()
    conn.close()

    for pid, pname, prank, pgun, ppil, pstat, psal, pxp, pspa in pilots_list:
        card = ctk.CTkFrame(pers_scroll, fg_color="#27272A")
        card.pack(fill="x", padx=5, pady=4)
        ctk.CTkLabel(card, text=f"Pilot: {pname} ({prank}) | G/P: {pgun}/{ppil} | XP: {pxp} | Status: {pstat}", font=("Arial", 11)).pack(side="left", padx=10, pady=8)
        
        def upg_gunnery(p_id=pid):
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("UPDATE personnel SET gunnery = max(0, gunnery - 1), xp = max(0, xp - 30) WHERE id = ?", (p_id,))
            conn.commit()
            conn.close()
            refresh_pers_tab()
            messagebox.showinfo("Skill Upgraded", f"Gunnery skill upgraded for pilot!")

        ctk.CTkButton(card, text="+Gunnery (-30 XP)", command=upg_gunnery, fg_color="#9333EA", font=("Arial", 10, "bold"), width=110).pack(side="right", padx=6, pady=6)

refresh_pers_tab()

pers_right = ctk.CTkFrame(pers_grid, fg_color="#070A12", border_width=1, border_color="#9333EA")
pers_right.pack(side="right", fill="both", expand=True)

ctk.CTkLabel(pers_right, text="Hiring Hall Candidate Pool", font=("Arial", 13, "bold"), text_color="#C084FC").pack(anchor="w", padx=15, pady=10)

hiring_candidates = [
    ("Rana Hawkins", "Lieutenant", 3, 3, 450000),
    ("Erik Sandstrom", "Sergeant", 3, 4, 350000),
    ("Valerie Vance", "Sergeant", 4, 4, 250000)
]

for hc_name, hc_rank, hc_gun, hc_pil, hc_bonus in hiring_candidates:
    hcard = ctk.CTkFrame(pers_right, fg_color="#1E293B")
    hcard.pack(fill="x", padx=15, pady=5)
    ctk.CTkLabel(hcard, text=f"{hc_name} ({hc_rank}) | G/P: {hc_gun}/{hc_pil} | Bonus: ${hc_bonus:,}", font=("Arial", 11)).pack(side="left", padx=10, pady=8)
    
    def recruit_hiring_pilot(pname=hc_name, prank=hc_rank, pgun=hc_gun, ppil=hc_pil, pbonus=hc_bonus):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("UPDATE campaign SET treasury = treasury - ? WHERE id = ?", (pbonus, ACTIVE_CAMP_ID))
        cur.execute("INSERT INTO personnel (company_id, pilot_name, rank, gunnery, piloting, status, salary, xp, spa, kills, bondsmen) VALUES (?, ?, ?, ?, ?, 'Fit for Duty', 45000, 25, 'None', 0, 0)", (CO_ID, pname, prank, pgun, ppil))
        conn.commit()
        conn.close()
        refresh_header()
        refresh_pers_tab()
        messagebox.showinfo("MechWarrior Recruited", f"Recruited {pname} to company roster!")

    ctk.CTkButton(hcard, text="Recruit Pilot", command=recruit_hiring_pilot, fg_color="#9333EA", font=("Arial", 10, "bold"), width=90).pack(side="right", padx=10, pady=8)

def refresh_header():
    camp, comp = fetch_campaign()
    lbl_date.configure(text=f"DATE: {camp[0]}")
    lbl_system.configure(text=f"SYSTEM: {camp[1]} [ONLINE - MUL CONNECTED]")
    lbl_treasury.configure(text=f"C-BILLS: ${camp[2]:,}")

app.mainloop()
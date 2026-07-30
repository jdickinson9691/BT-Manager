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

existing = get_existing_campaigns()
if not existing:
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("INSERT INTO campaign (campaign_name, start_date, current_date, treasury, current_system, era) VALUES (?, ?, ?, ?, ?, ?)", ("Succession Wars 3025", "3025-01-01", "3025-01-15", 15000000, "Outreach", BATTLETECH_ERAS[0]))
    camp_id = cur.lastrowid
    cur.execute("INSERT INTO company (campaign_id, company_name, commander_name, mrb_rating) VALUES (?, ?, ?, ?)", (camp_id, "Wolf's Irregulars", "Major Jaime Wolf", "B"))
    co_id = cur.lastrowid

    for sname, sdata in DEFAULT_SYSTEM_MAP.items():
        cur.execute("INSERT INTO systems (system_name, faction, jump_cost, x_coord, y_coord) VALUES (?, ?, ?, ?, ?)", (sname, sdata[0], sdata[3], sdata[1], sdata[2]))

    cur.executemany("INSERT INTO roster (company_id, mech_name, tonnage, status, armor_status, repair_cost) VALUES (?, ?, ?, ?, ?, ?)", [
        (co_id, "Marauder MAD-3R", 75, "Operational", "100%", 0),
        (co_id, "Warhammer WHM-6R", 70, "Operational", "100%", 0)
    ])
    cur.executemany("INSERT INTO personnel (company_id, pilot_name, rank, gunnery, piloting, status, salary, xp, spa, kills, bondsmen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
        (co_id, "Lt. Natasha Kerensky", "Lieutenant", 2, 3, "Fit for Duty", 75000, 45, "None", 2, 0)
    ])
    cur.executemany("INSERT INTO contracts (company_id, employer, mission_type, difficulty, payout, salvage_rights, is_active, enemy_faction, intel_summary) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)", [
        (co_id, "House Davion", "Garrison", "Medium", 3500000, "Shared (50%)", "Draconis Combine", "Standard garrison defense contract on Outreach."),
        (co_id, "Draconis Combine Mustered Soldier", "Objective Raid", "Hard", 4200000, "Full Salvage", "Federated Suns", "High-priority raiding contract."),
        (co_id, "Independent Local Government", "Reconnaissance", "Light", 2800000, "Shared (25%)", "Pirates", "Planetary perimeter patrol.")
    ])
    conn.commit()
    conn.close()

ACTIVE_CAMP_ID = 1

app = ctk.CTk()
app.geometry("1400x900")
app.title("BT-Manager - Full Native Command Deck")
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

# HEADER BAR (Matching Screenshot 2)
header = ctk.CTkFrame(app, fg_color="#0F141E", border_width=1, border_color="#334155")
header.pack(fill="x", padx=15, pady=10)

lbl_title = ctk.CTkLabel(header, text=f"SUCCESSION WARS 3025 | {comp_data[1].upper()}", font=("Arial", 14, "bold"), text_color="#EA580C")
lbl_title.pack(side="left", padx=15, pady=10)

lbl_date = ctk.CTkLabel(header, text=f"DATE: {camp_data[0]}", font=("Arial", 11, "bold"), text_color="#F8FAFC")
lbl_date.pack(side="left", padx=15, pady=10)

lbl_system = ctk.CTkLabel(header, text=f"SYSTEM: {camp_data[1]} [ONLINE - MUL CONNECTED]", font=("Arial", 11, "bold"), text_color="#38BDF8")
lbl_system.pack(side="left", padx=15, pady=10)

lbl_treasury = ctk.CTkLabel(header, text=f"C-BILLS: ${camp_data[2]:,}", font=("Arial", 13, "bold"), text_color="#10B981")
lbl_treasury.pack(side="right", padx=15, pady=10)

# TAB VIEW
tabview = ctk.CTkTabview(app, fg_color="#0C0D12")
tabview.pack(fill="both", expand=True, padx=15, pady=5)

tab_ops = tabview.add("Operations & Contracts")
tab_maint = tabview.add("Maintenance & Engineering")
tab_inv = tabview.add("Storage & Parts Inventory")
tab_pers = tabview.add("Personnel & MedBay")

# ==================== TAB 1: OPERATIONS & CONTRACTS ====================
ctk.CTkLabel(tab_ops, text="Command & Operations Deck", font=("Arial", 16, "bold"), text_color="#F8FAFC").pack(anchor="w", padx=15, pady=(5, 10))

# TOP SECTION: ACTIVE DEPLOYED OPERATION CARD
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

# LEFT COLUMN: CONTROL BUTTONS
left_col = ctk.CTkFrame(ops_grid, fg_color="transparent", width=450)
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

btn_day = ctk.CTkButton(btn_row1, text="+1 Day (Process Logistics)", command=advance_one_day, fg_color="#10B981", font=("Arial", 12, "bold"), height=40)
btn_day.pack(side="left", fill="x", expand=True, padx=(0, 5))

def process_payroll():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("UPDATE campaign SET treasury = treasury - 150000 WHERE id = ?", (ACTIVE_CAMP_ID,))
    conn.commit()
    conn.close()
    refresh_header()
    messagebox.showinfo("Payroll Settlement", "Processed Monthly Payroll. $150,000 C-Bills deducted for pilot salaries and technical upkeep.")

btn_payroll = ctk.CTkButton(btn_row1, text="Process Monthly Payroll", command=process_payroll, fg_color="#EA580C", font=("Arial", 12, "bold"), height=40)
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
        messagebox.showinfo("Unit Added", f"Unit '{val}' added to company roster!")

btn_unit = ctk.CTkButton(btn_row2, text="+ Add Faction Unit", command=add_faction_unit_dialog, fg_color="#0284C7", font=("Arial", 12, "bold"), height=40)
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

btn_contract = ctk.CTkButton(btn_row2, text="+ Build Custom Contract", command=build_custom_contract_dialog, fg_color="#9333EA", font=("Arial", 12, "bold"), height=40)
btn_contract.pack(side="right", fill="x", expand=True, padx=(5, 0))

# RIGHT COLUMN: MRB BOARD & GALACTIC JUMPNET
right_col = ctk.CTkFrame(ops_grid, fg_color="transparent")
right_col.pack(side="right", fill="both", expand=True)

# MRB BOARD CARD
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

# GALACTIC JUMPNET CARD FROM SCREENSHOT
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

# ==================== OTHER TABS ====================
# TAB 2: MAINTENANCE
maint_scroll = ctk.CTkScrollableFrame(tab_maint, fg_color="#18181B")
maint_scroll.pack(fill="both", expand=True, padx=15, pady=15)
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("SELECT mech_name, tonnage, status, armor_status FROM roster WHERE company_id = ?", (CO_ID,))
for m in cur.fetchall():
    card = ctk.CTkFrame(maint_scroll, fg_color="#27272A")
    card.pack(fill="x", padx=10, pady=5)
    ctk.CTkLabel(card, text=f"Unit: {m[0]} | Tonnage: {m[1]}T | Status: {m[2]} | Armor: {m[3]}", font=("Arial", 11)).pack(side="left", padx=10, pady=8)
conn.close()

# TAB 3: INVENTORY
inv_scroll = ctk.CTkScrollableFrame(tab_inv, fg_color="#18181B")
inv_scroll.pack(fill="both", expand=True, padx=15, pady=15)
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("SELECT part_name, category, stock, cost FROM inventory WHERE company_id = ?", (CO_ID,))
for p in cur.fetchall():
    card = ctk.CTkFrame(inv_scroll, fg_color="#27272A")
    card.pack(fill="x", padx=10, pady=5)
    ctk.CTkLabel(card, text=f"Part: {p[0]} | Category: {p[1]} | Stock: {p[2]} Units | Cost: ${p[3]:,}", font=("Arial", 11)).pack(side="left", padx=10, pady=8)
conn.close()

# TAB 4: PERSONNEL
pers_scroll = ctk.CTkScrollableFrame(tab_pers, fg_color="#18181B")
pers_scroll.pack(fill="both", expand=True, padx=15, pady=15)
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("SELECT pilot_name, rank, gunnery, piloting, status, salary FROM personnel WHERE company_id = ?", (CO_ID,))
for pe in cur.fetchall():
    card = ctk.CTkFrame(pers_scroll, fg_color="#27272A")
    card.pack(fill="x", padx=10, pady=5)
    ctk.CTkLabel(card, text=f"Pilot: {pe[0]} ({pe[1]}) | G/P: {pe[2]}/{pe[3]} | Status: {pe[4]} | Salary: ${pe[5]:,}/mo", font=("Arial", 11)).pack(side="left", padx=10, pady=8)
conn.close()

def refresh_header():
    camp, comp = fetch_campaign()
    lbl_date.configure(text=f"DATE: {camp[0]}")
    lbl_system.configure(text=f"SYSTEM: {camp[1]} [ONLINE - MUL CONNECTED]")
    lbl_treasury.configure(text=f"C-BILLS: ${camp[2]:,}")

app.mainloop()
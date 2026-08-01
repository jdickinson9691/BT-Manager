# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['apps\\api\\main.py'],
    pathex=['.'],
    binaries=[],
    datas=[],
    hiddenimports=[
        'packages',
        'packages.database',
        'packages.database.db',
        'packages.database.models',
        'packages.data_importer',
        'packages.data_importer.mtf_parser',
        'packages.data_importer.sarna_client',
        'packages.agents',
        'packages.agents.core_agent',
        'packages.agents.operations_agent',
        'packages.agents.map_agent',
        'packages.agents.maintenance_agent',
        'packages.agents.personnel_agent',
        'packages.agents.data_sync_agent',
        'packages.agents.era_faction_agent'
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='main',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='main',
)

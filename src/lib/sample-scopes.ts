export interface SampleScope {
  slug: string
  title: string
  metaDescription: string
  projectType: string
  exampleDescription: string
  sow: string
}

export const SAMPLE_SCOPES: SampleScope[] = [
  {
    slug: 'roof-leak-repair',
    title: 'Roof Leak Repair',
    metaDescription: 'Sample Scope of Work for roof leak repair — materials, labor, and cost estimate. See what a TAGS-generated SOW looks like before you start your project.',
    projectType: 'Roofing',
    exampleDescription: 'There is an active leak coming through the ceiling in the master bedroom. The water stain is about 2 feet wide. It only leaks during heavy rain. The roof is about 12 years old.',
    sow: `**Date Prepared:** Example Only

## Project Overview
Investigate and repair active roof leak affecting the master bedroom ceiling. Based on the described symptoms — leak occurring during heavy rain with a localized ceiling stain — the likely source is failed flashing, damaged shingles, or compromised underlayment in the corresponding roof section. Full diagnosis requires on-site inspection.

## Scope of Work
1. Inspect roof surface above master bedroom for visible damage, missing or lifted shingles, and cracked flashing
2. Check all pipe penetrations, vents, and valleys in the affected area
3. Remove and replace damaged shingles as identified (estimated 15–25 SF)
4. Remove and replace failed step or counter flashing at any adjacent wall or penetration
5. Install new self-adhering ice-and-water shield underlayment beneath repaired section
6. Seal all penetrations with roofing-grade sealant
7. Inspect attic space for moisture damage and mold — document findings
8. Test repaired section with controlled water application before closing

## Materials Required
- Architectural shingles (matching) — ~25 SF — ~$2.50/SF (~$65)
- Self-adhering ice-and-water shield — 1 roll — ~$80
- Step/counter flashing (aluminum) — 10 LF — ~$1.50/LF (~$15)
- Roofing nails — 1 lb — ~$8
- Roofing sealant — 1 tube — ~$12
- Drip edge (if needed) — 10 LF — ~$10
- **Materials subtotal (with 12% overage): ~$215**

## Labor Requirements
- Trade: Roofer
- Crew: 1–2 technicians
- Estimated hours: 4–6 hours
- **Labor subtotal (with 25% overhead): ~$500**

---

## Estimated Project Cost
| | Ballpark Estimate |
|---|---|
| Materials | $215 |
| Labor | $500 |
| **TOTAL** | **$715** |

> ⚠️ Ballpark estimate for scoping purposes only. Actual cost depends on roof pitch, extent of damage found on-site, and regional labor rates.

## Site Safety Requirements
- OSHA fall protection required for any roof work above 6 feet
- Non-slip footwear required
- Spotter required for ladder work
- Do not work during rain, ice, or high winds

## Cleanup & Disposal
- Remove all debris, old shingles, and packaging from roof and grounds
- Haul away to licensed disposal facility
- Inspect gutters and downspouts — clear any displaced granules

## Warranty Expectations
- Workmanship warranty: minimum 1 year on all repairs
- Materials warranty per manufacturer specifications
- Any concealed rot or structural damage discovered during repair constitutes a change order`,
  },
  {
    slug: 'bathroom-remodel',
    title: 'Bathroom Remodel',
    metaDescription: 'Sample Scope of Work for a full bathroom remodel — tile, fixtures, plumbing, and cost estimate. See a professional TAGS-generated SOW before starting your renovation.',
    projectType: 'Plumbing / Tile',
    exampleDescription: 'Full bathroom remodel. We want to replace the vanity, toilet, floor tile, and shower tile. The bathroom is about 55 square feet. Currently has a tub/shower combo that we want to convert to a walk-in shower.',
    sow: `**Date Prepared:** Example Only

## Project Overview
Full bathroom remodel in an approximately 55 SF space. Scope includes removal of existing tub/shower combo and conversion to walk-in shower, new floor tile, vanity replacement, and toilet replacement. Work requires licensed plumber and tile setter coordination.

## Scope of Work
1. Protect adjacent areas; shut off water supply to bathroom
2. Demolish existing tub/shower combo — remove tub, surround, and backer board
3. Remove existing floor tile and prep subfloor (level and waterproof as needed)
4. Remove and dispose of existing vanity and toilet
5. Frame and waterproof new walk-in shower area — install Schluter or Wedi board system
6. Install new shower floor pan and linear or center drain
7. Install wall tile in shower (floor to ceiling, estimated 65 SF)
8. Install new floor tile throughout bathroom (55 SF)
9. Install new vanity and faucet per owner selection
10. Install new toilet (standard or comfort height per owner)
11. Connect all plumbing — supply lines, drain, shutoff valves
12. Install shower door or frameless glass enclosure
13. Caulk all seams, grout all tile, finish and touch up

## Materials Required
- Cement backer board / waterproofing system — ~$220
- Shower floor pan + drain — ~$180
- Wall tile (65 SF + 12% overage) — ~$520
- Floor tile (55 SF + 12% overage) — ~$385
- Tile setting materials (thinset, grout, spacers) — ~$140
- Vanity with sink (allowance) — ~$450
- Faucet set — ~$95
- Toilet — ~$220
- Shower door / enclosure (allowance) — ~$600
- Plumbing supplies (supply lines, shutoffs, drain) — ~$120
- **Materials subtotal (with 12% overage): ~$3,290**

## Labor Requirements
- Trades: Licensed plumber + tile setter + general labor
- Crew: 2–3 workers
- Estimated hours: 40–50 hours over 5–7 days
- **Labor subtotal (with 25% overhead): ~$3,500**

---

## Estimated Project Cost
| | Ballpark Estimate |
|---|---|
| Materials | $3,290 |
| Labor | $3,500 |
| **TOTAL** | **$6,790** |

> ⚠️ Ballpark estimate. Final cost depends on tile selections, fixture allowances, extent of subfloor repair, and regional labor rates.

## Site Safety Requirements
- Shut off water and verify no active flow before demolition
- GFCI outlets required near all wet areas per code
- Proper ventilation during adhesive and waterproofing application
- Confirm permit requirements with local building department

## Cleanup & Disposal
- Demo debris removed and hauled off daily
- All packaging disposed of properly
- Final clean of all tile and fixtures before handoff

## Warranty Expectations
- Tile installation: 1 year workmanship
- Waterproofing: 2 years
- Plumbing connections: 1 year
- Manufacturer warranties on all fixtures and hardware`,
  },
  {
    slug: 'window-repair',
    title: 'Window Repair & Replacement',
    metaDescription: 'Sample Scope of Work for window repair or replacement — failed seals, damaged frames, full replacement. See a professional TAGS SOW example.',
    projectType: 'Windows / Carpentry',
    exampleDescription: 'Three windows in the living room have failed seals — the glass is foggy between the panes. One window in the bedroom has a cracked frame and does not close properly. We want to replace all four windows.',
    sow: `**Date Prepared:** Example Only

## Project Overview
Replace four windows: three double-pane units with failed seals (fogged glass) in the living room, and one window with a damaged frame and compromised closure in the bedroom. All units to be replaced with new energy-efficient double-pane windows matching existing rough opening dimensions.

## Scope of Work
1. Measure all four existing window rough openings and confirm new unit sizes
2. Order replacement windows (allow 1–2 week lead time for custom sizes)
3. Remove interior and exterior trim on all four windows — set aside reusable pieces
4. Remove existing window units from rough openings — dispose of old units
5. Inspect rough openings for rot, moisture damage, or structural issues — repair as found
6. Install new window units per manufacturer specifications — shim and level
7. Apply continuous bead of low-expansion foam around perimeter (interior)
8. Apply flashing tape and exterior sealant at all seams and head flashing
9. Reinstall or replace interior and exterior trim
10. Paint or caulk trim to match existing finish
11. Test all windows for smooth operation, full closure, and locking function

## Materials Required
- Replacement windows (4 units, allowance for standard double-hung) — ~$280/unit (~$1,120)
- Low-expansion foam — 2 cans — ~$18
- Flashing tape — 1 roll — ~$22
- Exterior caulk — 2 tubes — ~$16
- Trim lumber (if replacement needed) — ~$60
- Paint / primer — ~$35
- **Materials subtotal (with 12% overage): ~$1,430**

## Labor Requirements
- Trade: Carpenter / window installer
- Crew: 2 workers
- Estimated hours: 8–10 hours
- **Labor subtotal (with 25% overhead): ~$750**

---

## Estimated Project Cost
| | Ballpark Estimate |
|---|---|
| Materials | $1,430 |
| Labor | $750 |
| **TOTAL** | **$2,180** |

> ⚠️ Ballpark estimate. Final cost depends on window brand, size, and any rot or structural repair found during installation.

## Site Safety Requirements
- Secure openings immediately if windows are removed in advance of install date
- Wear gloves when handling glass — inspect for cracks before removal
- Ladder safety required for any second-floor work

## Cleanup & Disposal
- Remove and dispose of all old window units
- Vacuum all debris from interior sill areas
- Wipe down all new windows and hardware before handoff

## Warranty Expectations
- Window manufacturer warranty: typically 10–20 years on glass seal, 1–5 years on hardware
- Installation workmanship: 1 year`,
  },
  {
    slug: 'plumbing-leak',
    title: 'Plumbing Leak Repair',
    metaDescription: 'Sample Scope of Work for a plumbing leak — supply line, drain, fixture diagnosis and repair. See a professional TAGS SOW example with cost estimate.',
    projectType: 'Plumbing',
    exampleDescription: 'There is water pooling under the kitchen sink. The cabinet floor is wet and there is a musty smell. Not sure if it is the supply line, the drain, or the disposal.',
    sow: `**Date Prepared:** Example Only

## Project Overview
Diagnose and repair active leak under kitchen sink. Symptoms indicate potential failure at supply line connections, P-trap, drain basket, or garbage disposal gasket. Full diagnosis required on-site. Scope includes repair or replacement of failed components and assessment of cabinet for water damage.

## Scope of Work
1. Clear cabinet under sink and inspect all connections — supply lines, shutoff valves, P-trap, drain basket, and disposal
2. Identify source(s) of active leak
3. Replace both hot and cold supply lines (braided stainless, 1/2" x appropriate length)
4. Replace angle stop shutoff valves if corroded or non-functional
5. Replace P-trap assembly if cracked or joint-failed
6. Inspect and re-seal drain basket with plumber's putty if leaking at base
7. Inspect garbage disposal gasket and flange — replace if failed
8. Run water and check all connections under pressure — confirm no active drips
9. Inspect cabinet floor and back wall for moisture damage — document and report
10. Apply mold-preventive treatment to cabinet interior if moisture damage is present

## Materials Required
- Braided supply lines (2) — ~$12 each (~$24)
- Angle stop valves (2) — ~$15 each (~$30)
- P-trap assembly — ~$18
- Drain basket gasket / putty — ~$8
- Disposal gasket (if needed) — ~$12
- Plumber's tape — ~$3
- Mold treatment spray — ~$15
- **Materials subtotal (with 12% overage): ~$125**

## Labor Requirements
- Trade: Licensed plumber
- Crew: 1 plumber
- Estimated hours: 2–3 hours
- **Labor subtotal (with 25% overhead): ~$285**

---

## Estimated Project Cost
| | Ballpark Estimate |
|---|---|
| Materials | $125 |
| Labor | $285 |
| **TOTAL** | **$410** |

> ⚠️ Ballpark estimate. If disposal replacement or cabinet repair is required, cost will increase. Contractor to provide change order if additional work is identified.

## Site Safety Requirements
- Shut off water supply before any work
- Verify no active flow at shutoffs before disconnecting lines
- Check for mold — if significant growth found, escalate to mold remediation

## Cleanup & Disposal
- Remove all old parts and packaging
- Dry and wipe down cabinet interior
- Leave work area clean and dry

## Warranty Expectations
- Plumbing connections: 1 year workmanship
- Parts per manufacturer warranty`,
  },
  {
    slug: 'drywall-repair',
    title: 'Drywall Repair & Painting',
    metaDescription: 'Sample Scope of Work for drywall repair and painting — patch, texture match, prime, and paint. Professional TAGS SOW example with cost estimate.',
    projectType: 'Drywall / Painting',
    exampleDescription: 'There is a hole in the hallway wall about the size of a doorknob, and two smaller nail pops in the living room. We want it patched, textured to match, and painted to match the existing wall color.',
    sow: `**Date Prepared:** Example Only

## Project Overview
Repair three drywall defects: one doorknob-sized hole in the hallway and two nail pops in the living room. All repairs to be finished with matching texture and paint. Owner to provide existing paint color information or sample for color matching.

## Scope of Work
1. Cut out and frame doorknob hole to clean edges — install backing or California patch
2. Apply joint compound in multiple coats, feathering edges
3. Address nail pops — reset fasteners, apply joint compound, feather smooth
4. Sand all repairs smooth between coats
5. Apply texture to match existing wall finish (knock-down, orange peel, or smooth as applicable)
6. Prime all repaired areas with PVA drywall primer
7. Paint repaired areas to blend — spot paint or roll full wall section as needed for match
8. Final inspection — confirm texture and sheen match from normal viewing distance

## Materials Required
- Drywall patch / California patch kit — ~$12
- Joint compound (premixed, 1 qt) — ~$9
- Drywall screws (box) — ~$6
- Sandpaper assortment — ~$8
- PVA primer (1 qt) — ~$14
- Paint (1 qt, matching) — ~$22
- Painter's tape + drop cloth — ~$12
- **Materials subtotal (with 12% overage): ~$95**

## Labor Requirements
- Trade: Drywall finisher / painter
- Crew: 1 worker
- Estimated hours: 4–5 hours (including dry time between coats)
- **Labor subtotal (with 25% overhead): ~$325**

---

## Estimated Project Cost
| | Ballpark Estimate |
|---|---|
| Materials | $95 |
| Labor | $325 |
| **TOTAL** | **$420** |

> ⚠️ Ballpark estimate. Exact texture match cannot be guaranteed — full wall repaint may be required for seamless results.

## Site Safety Requirements
- Adequate ventilation during sanding and painting
- Dust mask required during sanding
- Check for electrical or plumbing behind wall before cutting

## Cleanup & Disposal
- Remove all dust, joint compound debris, and packaging
- Protect flooring with drop cloth during all work
- Leave walls clean and paint tools removed

## Warranty Expectations
- Workmanship warranty: 1 year on all repairs
- Paint adhesion: per manufacturer specifications`,
  },
  {
    slug: 'hvac-service',
    title: 'HVAC Tune-Up & Repair',
    metaDescription: 'Sample Scope of Work for HVAC tune-up and repair — filter, coil cleaning, refrigerant check. Professional TAGS SOW with cost estimate.',
    projectType: 'HVAC',
    exampleDescription: 'The AC is not cooling as well as it used to. It runs constantly but the house stays warm. We want a full tune-up and to find out if anything needs to be repaired.',
    sow: `**Date Prepared:** Example Only

## Project Overview
Diagnose reduced cooling performance on residential central air conditioning system. System runs continuously without reaching setpoint temperature — likely causes include dirty evaporator or condenser coils, low refrigerant charge, restricted airflow, or aging compressor. Full diagnostic and tune-up to identify root cause.

## Scope of Work
1. Inspect and replace air filter (1-inch standard or customer-supplied media filter)
2. Inspect evaporator coil (indoor unit) — clean with coil cleaner if fouled
3. Inspect and clean condenser coil (outdoor unit) — rinse with water, apply coil cleaner
4. Check refrigerant charge via manifold gauges — document superheat and subcooling
5. Add refrigerant if charge is low (requires EPA 608 certification) — note: persistent low charge indicates leak
6. Inspect and test capacitors (run and start) — replace if reading is out of spec
7. Check contactor for pitting or failure — replace if worn
8. Inspect blower motor, belt, and bearings — lubricate if applicable
9. Test thermostat calibration and operation
10. Measure supply and return air temperature differential — target 16–22°F split
11. Document all findings and provide written report

## Materials Required
- Air filter (1-inch, standard size) — ~$18
- Coil cleaner (1 can) — ~$22
- Refrigerant (R-410A, up to 1 lb if needed) — ~$45
- Capacitor (if replacement needed) — ~$35
- Contactor (if replacement needed) — ~$25
- Lubricant — ~$8
- **Materials subtotal (with 12% overage): ~$175**

## Labor Requirements
- Trade: Licensed HVAC technician
- Crew: 1 technician
- Estimated hours: 2–3 hours
- **Labor subtotal (with 25% overhead): ~$315**

---

## Estimated Project Cost
| | Ballpark Estimate |
|---|---|
| Materials | $175 |
| Labor | $315 |
| **TOTAL** | **$490** |

> ⚠️ Ballpark estimate for tune-up and minor repair. If compressor, coil replacement, or leak repair is required, cost will be significantly higher. Contractor to provide change order for major repairs.

## Site Safety Requirements
- Disconnect power at disconnect box before servicing indoor or outdoor unit
- EPA 608 certification required for any refrigerant handling
- Do not operate system if compressor is making abnormal noise — risk of further damage

## Cleanup & Disposal
- Dispose of old filter and packaging
- Rinse condenser area clean
- Leave all panels secured before departure

## Warranty Expectations
- Diagnostic and tune-up labor: 30 days
- Parts replaced: 1 year workmanship, manufacturer warranty on components`,
  },
  {
    slug: 'flooring-replacement',
    title: 'Flooring Replacement',
    metaDescription: 'Sample Scope of Work for flooring replacement — LVP, tile, or carpet removal and installation. Professional TAGS SOW example with cost estimate.',
    projectType: 'Flooring',
    exampleDescription: 'Replace the flooring in the living room, dining room, and hallway. Currently has old carpet that is stained and worn. Total area is about 650 square feet. We want to install luxury vinyl plank.',
    sow: `**Date Prepared:** Example Only

## Project Overview
Remove existing carpet and install luxury vinyl plank (LVP) flooring in living room, dining room, and hallway — approximately 650 SF total. Scope includes subfloor inspection, prep, and floating LVP installation with appropriate underlayment.

## Scope of Work
1. Remove existing carpet, padding, and tack strips — dispose of all material
2. Inspect subfloor for high spots, low spots, squeaks, and moisture
3. Flatten subfloor as needed — fill low spots with floor leveler, sand high spots
4. Install vapor barrier / underlayment per LVP manufacturer requirements
5. Install LVP flooring using floating method — maintain expansion gaps at all walls
6. Cut and fit around door frames, thresholds, and transitions
7. Install transition strips at doorways and room transitions
8. Install new baseboards or reinstall existing baseboards with new shoe molding
9. Touch up paint at baseboard level as needed

## Materials Required
- LVP flooring (650 SF + 10% waste = ~715 SF) — ~$3.20/SF (~$2,290)
- Underlayment / vapor barrier — ~$0.25/SF (~$180)
- Tack strip disposal / floor leveler — ~$65
- Transition strips (5 doorways) — ~$18 each (~$90)
- Shoe molding (200 LF) — ~$0.80/LF (~$160)
- Construction adhesive / fasteners — ~$30
- **Materials subtotal (with 12% overage): ~$3,155**

## Labor Requirements
- Trade: Flooring installer
- Crew: 2 workers
- Estimated hours: 14–18 hours over 2 days
- **Labor subtotal (with 25% overhead): ~$1,400**

---

## Estimated Project Cost
| | Ballpark Estimate |
|---|---|
| Materials | $3,155 |
| Labor | $1,400 |
| **TOTAL** | **$4,555** |

> ⚠️ Ballpark estimate based on standard LVP at ~$3.20/SF. Premium product selections or significant subfloor leveling will increase cost.

## Site Safety Requirements
- Clear all furniture prior to crew arrival
- Ensure adequate ventilation — LVP off-gassing during installation
- Keep children and pets out of work area during installation

## Cleanup & Disposal
- Haul away all carpet, padding, and tack strips
- Vacuum entire finished floor before furniture return
- Remove all packaging and trim debris

## Warranty Expectations
- Installation workmanship: 1 year
- LVP product warranty: per manufacturer (typically 10–25 years on residential wear layer)`,
  },
  {
    slug: 'electrical-outlet',
    title: 'Electrical Outlet & Panel Work',
    metaDescription: 'Sample Scope of Work for electrical outlet replacement and panel inspection — GFCI, standard outlets, circuit breakers. Professional TAGS SOW example.',
    projectType: 'Electrical',
    exampleDescription: 'Three outlets in the kitchen are not working. One outlet in the bathroom sparks when you plug something in. We also want to have the panel inspected since the house is from the 1980s.',
    sow: `**Date Prepared:** Example Only

## Project Overview
Diagnose and repair three non-functional kitchen outlets and one sparking bathroom outlet. Additionally perform electrical panel inspection on a 1980s-era panel. Sparking outlet is a safety concern — prioritize that repair. All work requires licensed electrician and must meet current NEC code requirements.

## Scope of Work
1. Diagnose non-functional kitchen outlets — check for tripped GFCI upstream, open circuit, or failed devices
2. Reset or replace upstream GFCI outlet if that is source of kitchen outage (kitchen outlets likely daisy-chained from GFCI)
3. If wiring issue: trace circuit, identify fault, repair or replace wiring as needed
4. Replace sparking bathroom outlet immediately — install GFCI outlet per NEC code (all bathroom outlets require GFCI)
5. Inspect bathroom outlet box for signs of arcing, char, or damaged wiring — replace wiring if compromised
6. Open panel and inspect: check for double-tapped breakers, signs of overheating, corrosion, Federal Pacific or Zinsco brand (known hazards), and proper labeling
7. Document all panel findings — provide written report with any safety recommendations
8. Replace any failed or undersized breakers identified during inspection
9. Confirm all circuits are properly labeled

## Materials Required
- GFCI outlet (bathroom, 20A) — ~$22
- Standard outlets (kitchen, up to 3) — ~$8 each (~$24)
- Outlet covers — ~$3 each (~$12)
- Wire nuts / electrical tape — ~$8
- Breakers (1–2 replacement, if needed) — ~$18 each (~$36)
- **Materials subtotal (with 12% overage): ~$115**

## Labor Requirements
- Trade: Licensed electrician
- Crew: 1 electrician
- Estimated hours: 3–5 hours
- **Labor subtotal (with 25% overhead): ~$525**

---

## Estimated Project Cost
| | Ballpark Estimate |
|---|---|
| Materials | $115 |
| Labor | $525 |
| **TOTAL** | **$640** |

> ⚠️ Ballpark estimate. If panel replacement or rewiring is required (common in older homes), cost will be significantly higher. Electrician to provide change order for any major work identified.

## Site Safety Requirements
- Licensed electrician required for all work
- Turn off circuit breakers before any outlet work — verify with non-contact tester
- Sparking outlet: do not use until repaired — shock and fire risk
- Permit may be required for panel work — verify with local AHJ

## Cleanup & Disposal
- Remove all old devices and packaging
- Patch any wall openings from wiring access
- Leave panel door closed and labeled

## Warranty Expectations
- Workmanship: 1 year
- GFCI outlet: manufacturer warranty (typically 1 year)
- Breakers: manufacturer warranty`,
  },
  {
    slug: 'gutter-repair',
    title: 'Gutter Repair & Replacement',
    metaDescription: 'Sample Scope of Work for gutter repair and replacement — leaking joints, sagging sections, downspout work, and concealed fascia conditions. See what a TAGS-generated SOW looks like.',
    projectType: 'Exterior',
    exampleDescription: 'Gutters are pulling away from the fascia on the back of the house and leaking at the corners. The downspouts look okay but I haven\'t checked them. The house is about 15 years old.',
    sow: `**Date Prepared:** Example Only

## Project Overview
Inspect, repair, and/or replace residential gutter system along affected elevations. Reported issues — gutters separating from fascia and leaking at corner joints — indicate failed fasteners, deteriorated sealant, and possible fascia rot at attachment points. Full scope to be confirmed by on-site assessment. *Note: If fascia board rot, soffit damage, or structural deterioration is found during inspection, additional remediation will be required before gutters can be properly secured — see Exclusions.*

## Scope of Work
1. Inspect full perimeter gutter system for separation, sagging, joint failure, and fascia condition at all attachment points
2. Clean all gutters and downspouts of debris; flush downspouts to confirm clear drainage
3. Remove and re-secure any gutter sections pulling away from fascia using new gutter screws (replace spikes where present)
4. Reseal all leaking miters, end caps, and outlet connections with compatible gutter sealant
5. Adjust pitch on sagging sections to maintain minimum 1/16-inch drop per foot toward downspout outlets
6. Replace damaged or failed gutter sections as identified during inspection (est. linear footage TBD)
7. Inspect, secure, and replace any failed downspout elbows, connectors, or hangers
8. Confirm downspout discharge diverts water minimum 4 feet from foundation — add extensions where needed
9. Final flush and flow test after all work is complete

## Materials Required
- Seamless aluminum gutter sections (gauge and color to match existing or as specified)
- Gutter screws and hidden hangers
- Corner miters and end caps as needed
- Gutter sealant (compatible with aluminum)
- Downspout elbows, connectors, and extensions as needed

## Labor Requirements
- 1–2 technicians; 4–8 hours depending on scope and elevation access
- Ladder access to all roof perimeter areas required
- Scaffolding may be required for two-story elevations

## Site Safety Requirements
- Roof edge fall protection or spotter required during inspection of upper elevations
- Ladder stabilizers required on all ladder placements; no lean against gutter
- Notify occupants before beginning work; keep ground-level work area clear

## Cleanup & Disposal
- All gutter debris bagged and removed from site
- Old fasteners, failed sections, and packaging removed
- Job site broom-clean upon completion; landscaping cleared of debris

## Warranty Expectations
- Workmanship warranty on new sections, fasteners, and sealed joints: 1 year minimum
- Manufacturer material warranty applies to new gutter sections and hardware
- Warranty void if fascia rot is not addressed prior to gutter re-attachment

## Exclusions
Fascia board repair or replacement; soffit repair; roof or shingle work; painting or finishing of new gutter sections unless specified; landscaping damage from ladder access. Any concealed fascia rot or structural damage discovered during installation will be documented and quoted separately before proceeding.

## Estimated Project Cost
| | |
|---|---|
| Materials | $400–$900 |
| Labor | $600–$1,400 |
| **TOTAL** | **$1,000–$2,300** |

*Range reflects scope variation — full replacement costs more than repair. Final cost confirmed after on-site inspection. Actual costs vary by region, labor market, and material availability.*`,
  },
  {
    slug: 'concrete-repair',
    title: 'Concrete Repair & Replacement',
    metaDescription: 'Sample Scope of Work for concrete driveway repair — 10×10 ft driveway section with 10 ft lazy curb replacement, including subgrade prep, saw-cut, pour, and cost estimate.',
    projectType: 'Flatwork / Site',
    exampleDescription: 'I need to replace a section of my driveway near the street entrance. The area is approximately 10 feet wide by 10 feet deep. The concrete is cracked and heaving. I also need the lazy curb along the street edge replaced — it\'s about 10 feet long and broken in two places.',
    sow: `**Date Prepared:** Example Only

## Project Overview
Remove and replace one deteriorated driveway section measuring approximately **10 ft × 10 ft (100 SF)** at the street entrance, including replacement of the adjacent **10 LF lazy curb** (rolled mountable curb) along the street edge. Existing concrete shows heaving, transverse cracking, and surface spalling consistent with subgrade settlement and freeze-thaw deterioration. Lazy curb shows two fracture points with displacement. *Note: If subgrade erosion, utility conflicts, or root intrusion are found during excavation, additional remediation will be required before concrete can be poured — see Exclusions.*

## Scope of Work
1. Mark work area boundaries; call 811 utility locate minimum 48 hours before excavation
2. Saw-cut existing driveway section at clean, straight lines to isolate the 10 ft × 10 ft removal area; saw-cut lazy curb at both ends to create clean tie-in joints
3. Demolish and remove approximately 100 SF of driveway slab and 10 LF of lazy curb; haul all concrete debris off-site
4. Excavate subgrade to 4-inch depth across driveway section and 6-inch depth under lazy curb profile; inspect for soft spots, erosion, or root intrusion — document findings before proceeding
5. Compact subgrade; install and compact minimum 4-inch crushed aggregate base (3/4-inch stone) across full driveway area; compact lazy curb subgrade to match existing curb profile
6. Install form boards for driveway section at correct grade and pitch — minimum 1/8-inch per foot slope away from garage for drainage; form lazy curb to match existing street profile and radius
7. Install expansion joint material at tie-in with existing driveway and at garage apron interface
8. Pour 4,000 PSI concrete with synthetic fiber reinforcement across both areas in a single pour where feasible; finish driveway section to broom texture; finish lazy curb to smooth rolled profile matching existing
9. Saw-cut one transverse control joint at the 5-foot mark in the driveway section to manage future cracking
10. Protect fresh concrete: foot traffic — 48 hours minimum; vehicle traffic — 7 days minimum; heavy loads — 28 days

## Materials Required
| Item | Quantity | Notes |
|---|---|---|
| Ready-mix concrete, 4,000 PSI + fiber | ~1.75 CY | Covers 100 SF slab @ 4" + 10 LF lazy curb profile |
| Crushed aggregate base, 3/4" | ~1.5 CY | 4" depth under slab, 6" under curb |
| Form boards and stakes | 50 LF est. | Slab perimeter + curb forms |
| Expansion joint material | 20 LF est. | Tie-ins and apron interface |
| Concrete sealer (optional) | 1 gal | Coverage ~200 SF; apply after 28-day cure |

## Labor Requirements
- 2–3 crew members; 1 full day for demo, prep, and pour
- Ready-mix truck access from street required — confirm clearance before scheduling
- Saw-cut operator and equipment required for demolition cuts and control joint

## Site Safety Requirements
- Concrete PPE required: rubber boots, chemical-resistant gloves, eye protection for all crew
- Fresh concrete area barricaded with high-visibility tape and signage — pedestrian and vehicle access blocked until cured
- Saw-cut operations require dust suppression (wet method preferred), eye protection, and respiratory protection
- Street-side work requires traffic control or cones if curb work affects vehicle approach

## Cleanup & Disposal
- All demolished concrete (~1.5 CY) removed and disposed of off-site; concrete recycling preferred where available
- Excess aggregate and form materials removed
- Driveway approach and street edge broom-clean upon completion

## Warranty Expectations
- Workmanship warranty on new concrete flatwork and lazy curb: 1 year
- Control joints are designed to manage cracking — hairline cracks at joint locations are normal and expected
- Contractor not responsible for cracking caused by tree root intrusion, freeze-thaw cycles beyond normal, or vehicle loads exceeding residential design specification (typically 4,000 lbs per axle)
- Sealer reapplication every 3–5 years recommended

## Exclusions
Repair to existing driveway sections outside the 10 ft × 10 ft marked area; street curb repair beyond the 10 LF lazy curb; utility relocation; decorative finishing, staining, or stamping unless separately specified; landscaping or sod restoration adjacent to work area. Any concealed subgrade conditions discovered during excavation will be documented and quoted separately before proceeding.

## Estimated Project Cost
| | |
|---|---|
| Materials (concrete, base, forms) | $420 |
| Labor (demo, prep, pour, finish) | $980 |
| Disposal | $120 |
| **TOTAL** | **$1,520** |

*Based on 100 SF driveway section + 10 LF lazy curb at current national average trade rates. Does not include optional sealer ($80–$120) or subgrade remediation if concealed conditions are found. Actual costs vary by region and labor market.*`,
  },
]

export function getSampleBySlug(slug: string): SampleScope | undefined {
  return SAMPLE_SCOPES.find(s => s.slug === slug)
}

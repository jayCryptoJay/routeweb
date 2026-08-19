const rawList = `1342 Rosery Rd NE, 239 Regina Dr S, 220 Andrea Dr, 219 Teresa Dr, 149 Regina Dr N, 240 Teresa Dr, 1810 Betty Ln, 249 Jasper St #87, 250 Rosery Rd NW #222, 250 Rosery Rd NW #240, 250 Rosery Rd NW #319, 250 Rosery Rd NW #304, 210 Beechwood Ln, 225 Redwood Ln N, 24 Beechwood Ln, 513 Poinsettia Dr, 509 Poinsettia Dr, 632 Poinsettia Dr, 533 Parakeet Ln, 578 Blue Bird Ln, 466 Golden Gate Dr, 388 Buccaneer Dr, 285 Lalani Ln, 1156 San Marco Dr, 1175 San Remo Dr, 1185 San Remo Dr, 1140 San Remo Dr, 1029 Woodbrook Dr S, 1001 Woodbrook Dr, 1020 Woodbrook Dr, 1139 Woodbrook Dr, 120 Central Park Dr, 1130 6th Ave NE, 411 Tralee St, 430 Cork St, 431 Cork St, 1100 E Bay Dr #13, 273 4th St NW, 256 4th St NW, 602 8th Ave NW, 1025 Clearwater Largo Rd N #54, 1005 9th Ave NW, 702 9th St NW, 816 10th St NW, 607 12th St NW, 516 10th St NW, 1121 4th Ave NW, 834 2nd Ave NW, 1102 4th Ave NW, 610 11th St NW, 702 11th St NW, 1019 2nd Ave NW, 715 9th St NW, 192 Velma Dr W, 292 Velma Dr W, 316 Velma Dr W, 1663 Velma Dr N, 70 Tropic Blvd W, 617 Mehlenbacher Rd, 1606 Edna Ave, 679 14th St NW, 1200 Pine Ave NW, 1306 5th Ter NW, 619 14th St NW, 607 14th St NW, 6 Belle Meade Cir, 12 Pine Vista Dr, 2268 Indian Ave N, 499 Indian Rocks Rd N, 2162 Victory Ave, 2135 Victory Ave, 2109 Duncan Dr, 2548 Indian Ave #B, 97 Mineola Dr E, 1909 Pinetree Ln, 2170 Belmar Dr, 2293 Belmar Dr, 2255 Belmar Dr, 2083 Belmar Dr, 1840 Dolphin Dr, 503 Rosery Rd, 1610 Pinellas Rd, 455 Park Ave, 500 Althea Rd, 159 Osceola Rd, 222 Osceola Rd, 11 Fountain Sq, 219 Osceola Rd, 470 Park Ave, 420 Park Ave, 506 Osceola Rd, 511 Osceola Rd, 403 Oleander Rd, 7 Desoto Pl, 766 Indian Rocks Rd N, 2620 Renatta Dr, 420 Pinehurst Ave, 3001 Pinehurst Ave, 504 Cortez Ave, 784 Cortez Ave, 594 Lois Ln, 2726 Bayway Ave, 3089 Los Gatos Dr, 2747 Sunset Blvd, 3054 Sunset Blvd, 100 Bluff View Dr #403C, 100 Bluff View Dr #115A, 100 Bluff View Dr #108A, 100 Bluff View Dr #103A, 155 Bluff View Dr #102, 147 Bluff View Dr #401, 139 Bluff View Dr #307, 131 Bluff View Dr #205, 100 Bluff View Dr #302B, 100 Bluff View Dr #205B, 100 Bluff View Dr #111B, 202 Bluff View Dr, 508 Bluff View Dr, 23 Sunset Bay Dr, 1 Winston Dr, 32 Winston Dr, 28 Winston Dr, 7 N Pine Cir, 58 N Pine Cir, 18 N Pine Cir, 1737 Eagles Nest Dr, 1725 Eagles Nest Dr, 212 Garden Cir, 5 Stonegate Dr, 1711 Peaceful Ave, 5 Rosery Ln, 28 Evonaire Cir, 30 Evonaire Cir, 1704 Laurie Ln, 2940 W Bay Dr #204, 2940 W Bay Dr #302, 2940 W Bay Dr #501, 130 Indian Rocks Rd S, 213 Poinciana Ln, 217 Poinciana Ln, 113 Poinciana Ln, 605 Palm Dr, 226 Driftwood Ln, 222 Driftwood Ln, 109 Driftwood Ln, 506 Palm Dr, 126 Harbor View Ln, 104 Harbor View Ln, 50 Harbor View Ln #23, 50 Harbor View Ln #27, 107 Palmetto Ln, 111 Palmetto Ln, 127 Palmetto Ln, 130 Palmetto Ln, 119 Crestwood Ln, 104 Crestwood Ln, 131 Live Oak Ln, 203 Live Oak Ln, 207 Live Oak Ln, 206 Live Oak Ln, 213 Live Oak Ln, 202 Palm Dr`;

const items = rawList.split(',').map(s => s.trim()).filter(Boolean);

console.log("Total stops parsed:", items.length);

const parsed = items.map((raw, idx) => {
  const sequenceNumber = idx + 1;
  
  // Extract unit / lot
  let lotOrUnit = null;
  let cleanStreet = raw;
  const unitMatch = raw.match(/(#\w+|\b(?:Apt|Unit|Lot|Bldg|Suite|Spc)\s*#?\w+)/i);
  if (unitMatch) {
    lotOrUnit = unitMatch[0];
  }

  // Determine municipality
  let municipality = "Largo";
  const belleairStreets = [
    "Regina", "Andrea", "Teresa", "Jasper", "Beechwood", "Redwood", "Poinsettia", 
    "Parakeet", "Blue Bird", "Golden Gate", "Buccaneer", "Lalani", "San Marco", 
    "San Remo", "Woodbrook", "Indian Rocks Rd N", "Belmar", "Dolphin", "Pinellas Rd",
    "Park Ave", "Althea", "Osceola", "Fountain Sq", "Oleander", "Desoto", "Renatta",
    "Pinehurst", "Cortez", "Lois", "Bayway", "Los Gatos", "Sunset Blvd", "Bluff View",
    "Sunset Bay", "Winston", "Pine Cir", "Eagles Nest", "Garden Cir", "Stonegate",
    "Peaceful", "Rosery Ln", "Evonaire", "Laurie", "Indian Rocks Rd S", "Poinciana",
    "Palm Dr", "Driftwood", "Harbor View", "Palmetto", "Crestwood", "Live Oak"
  ];

  for (const b of belleairStreets) {
    if (raw.includes(b)) {
      municipality = "Belleair Bluffs";
      break;
    }
  }

  // Complex Name detection for mobile home parks and apartments
  let complexName = null;
  if (raw.includes("Bluff View Dr")) complexName = "Bluff View Condominiums";
  else if (raw.includes("Harbor View Ln") && lotOrUnit) complexName = "Harbor View Mobile Manor";
  else if (raw.includes("Jasper St") && lotOrUnit) complexName = "Jasper Mobile Home Park";
  else if (raw.includes("250 Rosery Rd NW")) complexName = "Rosery Palms Condominiums";
  else if (raw.includes("1100 E Bay Dr")) complexName = "East Bay Mobile Home Estates";
  else if (raw.includes("1025 Clearwater Largo Rd")) complexName = "Clearwater-Largo Mobile Park";
  else if (raw.includes("2940 W Bay Dr")) complexName = "West Bay Manor Apartments";

  // Road label: remove leading number and unit
  const streetWithoutNum = raw.replace(/^\d+\s+/, '').replace(/\s*(#\w+|\b(?:Apt|Unit|Lot|Bldg|Suite|Spc)\s*#?\w+)/i, '').trim();

  return {
    sequenceNumber,
    address: `${raw}, ${municipality}, FL`,
    rawAddress: raw,
    municipality,
    roadLabel: streetWithoutNum,
    lotOrUnit,
    complexName,
  };
});

import fs from "fs";

const fileContent = `/** The uploaded route in its original, locked delivery sequence. */
export interface RouteStopSeed {
  sequenceNumber: number;
  address: string;
  municipality: string;
  roadLabel: string;
  lotOrUnit?: string | null;
  complexName?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export const ROUTE_STOPS: RouteStopSeed[] = ${JSON.stringify(parsed, null, 2)};
`;

fs.writeFileSync("./shared/route-data.ts", fileContent, "utf-8");
console.log("Wrote updated shared/route-data.ts with", parsed.length, "stops.");

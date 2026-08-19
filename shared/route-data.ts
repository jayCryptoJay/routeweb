/** The uploaded route in its original, locked delivery sequence. */
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

export const ROUTE_STOPS: RouteStopSeed[] = [
  {
    "sequenceNumber": 1,
    "address": "1342 Rosery Rd NE, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Rosery Rd NE",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 2,
    "address": "239 Regina Dr S, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Regina Dr S",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 3,
    "address": "220 Andrea Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Andrea Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 4,
    "address": "219 Teresa Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Teresa Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 5,
    "address": "149 Regina Dr N, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Regina Dr N",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 6,
    "address": "240 Teresa Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Teresa Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 7,
    "address": "1810 Betty Ln, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Betty Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 8,
    "address": "249 Jasper St #87, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Jasper St",
    "lotOrUnit": "#87",
    "complexName": "Jasper Mobile Home Park"
  },
  {
    "sequenceNumber": 9,
    "address": "250 Rosery Rd NW #222, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Rosery Rd NW",
    "lotOrUnit": "#222",
    "complexName": "Rosery Palms Condominiums"
  },
  {
    "sequenceNumber": 10,
    "address": "250 Rosery Rd NW #240, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Rosery Rd NW",
    "lotOrUnit": "#240",
    "complexName": "Rosery Palms Condominiums"
  },
  {
    "sequenceNumber": 11,
    "address": "250 Rosery Rd NW #319, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Rosery Rd NW",
    "lotOrUnit": "#319",
    "complexName": "Rosery Palms Condominiums"
  },
  {
    "sequenceNumber": 12,
    "address": "250 Rosery Rd NW #304, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Rosery Rd NW",
    "lotOrUnit": "#304",
    "complexName": "Rosery Palms Condominiums"
  },
  {
    "sequenceNumber": 13,
    "address": "210 Beechwood Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Beechwood Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 14,
    "address": "225 Redwood Ln N, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Redwood Ln N",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 15,
    "address": "24 Beechwood Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Beechwood Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 16,
    "address": "513 Poinsettia Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Poinsettia Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 17,
    "address": "509 Poinsettia Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Poinsettia Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 18,
    "address": "632 Poinsettia Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Poinsettia Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 19,
    "address": "533 Parakeet Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Parakeet Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 20,
    "address": "578 Blue Bird Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Blue Bird Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 21,
    "address": "466 Golden Gate Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Golden Gate Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 22,
    "address": "388 Buccaneer Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Buccaneer Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 23,
    "address": "285 Lalani Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Lalani Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 24,
    "address": "1156 San Marco Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "San Marco Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 25,
    "address": "1175 San Remo Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "San Remo Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 26,
    "address": "1185 San Remo Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "San Remo Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 27,
    "address": "1140 San Remo Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "San Remo Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 28,
    "address": "1029 Woodbrook Dr S, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Woodbrook Dr S",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 29,
    "address": "1001 Woodbrook Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Woodbrook Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 30,
    "address": "1020 Woodbrook Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Woodbrook Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 31,
    "address": "1139 Woodbrook Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Woodbrook Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 32,
    "address": "120 Central Park Dr, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Central Park Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 33,
    "address": "1130 6th Ave NE, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "6th Ave NE",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 34,
    "address": "411 Tralee St, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Tralee St",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 35,
    "address": "430 Cork St, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Cork St",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 36,
    "address": "431 Cork St, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Cork St",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 37,
    "address": "1100 E Bay Dr #13, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "E Bay Dr",
    "lotOrUnit": "#13",
    "complexName": "East Bay Mobile Home Estates"
  },
  {
    "sequenceNumber": 38,
    "address": "273 4th St NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "4th St NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 39,
    "address": "256 4th St NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "4th St NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 40,
    "address": "602 8th Ave NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "8th Ave NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 41,
    "address": "1025 Clearwater Largo Rd N #54, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Clearwater Largo Rd N",
    "lotOrUnit": "#54",
    "complexName": "Clearwater-Largo Mobile Park"
  },
  {
    "sequenceNumber": 42,
    "address": "1005 9th Ave NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "9th Ave NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 43,
    "address": "702 9th St NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "9th St NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 44,
    "address": "816 10th St NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "10th St NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 45,
    "address": "607 12th St NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "12th St NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 46,
    "address": "516 10th St NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "10th St NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 47,
    "address": "1121 4th Ave NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "4th Ave NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 48,
    "address": "834 2nd Ave NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "2nd Ave NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 49,
    "address": "1102 4th Ave NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "4th Ave NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 50,
    "address": "610 11th St NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "11th St NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 51,
    "address": "702 11th St NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "11th St NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 52,
    "address": "1019 2nd Ave NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "2nd Ave NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 53,
    "address": "715 9th St NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "9th St NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 54,
    "address": "192 Velma Dr W, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Velma Dr W",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 55,
    "address": "292 Velma Dr W, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Velma Dr W",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 56,
    "address": "316 Velma Dr W, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Velma Dr W",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 57,
    "address": "1663 Velma Dr N, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Velma Dr N",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 58,
    "address": "70 Tropic Blvd W, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Tropic Blvd W",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 59,
    "address": "617 Mehlenbacher Rd, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Mehlenbacher Rd",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 60,
    "address": "1606 Edna Ave, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Edna Ave",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 61,
    "address": "679 14th St NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "14th St NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 62,
    "address": "1200 Pine Ave NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Pine Ave NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 63,
    "address": "1306 5th Ter NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "5th Ter NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 64,
    "address": "619 14th St NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "14th St NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 65,
    "address": "607 14th St NW, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "14th St NW",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 66,
    "address": "6 Belle Meade Cir, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Belle Meade Cir",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 67,
    "address": "12 Pine Vista Dr, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Pine Vista Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 68,
    "address": "2268 Indian Ave N, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Indian Ave N",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 69,
    "address": "499 Indian Rocks Rd N, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Indian Rocks Rd N",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 70,
    "address": "2162 Victory Ave, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Victory Ave",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 71,
    "address": "2135 Victory Ave, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Victory Ave",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 72,
    "address": "2109 Duncan Dr, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Duncan Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 73,
    "address": "2548 Indian Ave #B, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Indian Ave",
    "lotOrUnit": "#B",
    "complexName": null
  },
  {
    "sequenceNumber": 74,
    "address": "97 Mineola Dr E, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Mineola Dr E",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 75,
    "address": "1909 Pinetree Ln, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Pinetree Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 76,
    "address": "2170 Belmar Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Belmar Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 77,
    "address": "2293 Belmar Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Belmar Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 78,
    "address": "2255 Belmar Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Belmar Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 79,
    "address": "2083 Belmar Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Belmar Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 80,
    "address": "1840 Dolphin Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Dolphin Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 81,
    "address": "503 Rosery Rd, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "Rosery Rd",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 82,
    "address": "1610 Pinellas Rd, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Pinellas Rd",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 83,
    "address": "455 Park Ave, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Park Ave",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 84,
    "address": "500 Althea Rd, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Althea Rd",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 85,
    "address": "159 Osceola Rd, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Osceola Rd",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 86,
    "address": "222 Osceola Rd, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Osceola Rd",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 87,
    "address": "11 Fountain Sq, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Fountain Sq",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 88,
    "address": "219 Osceola Rd, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Osceola Rd",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 89,
    "address": "470 Park Ave, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Park Ave",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 90,
    "address": "420 Park Ave, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Park Ave",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 91,
    "address": "506 Osceola Rd, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Osceola Rd",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 92,
    "address": "511 Osceola Rd, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Osceola Rd",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 93,
    "address": "403 Oleander Rd, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Oleander Rd",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 94,
    "address": "7 Desoto Pl, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Desoto Pl",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 95,
    "address": "766 Indian Rocks Rd N, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Indian Rocks Rd N",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 96,
    "address": "2620 Renatta Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Renatta Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 97,
    "address": "420 Pinehurst Ave, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Pinehurst Ave",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 98,
    "address": "3001 Pinehurst Ave, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Pinehurst Ave",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 99,
    "address": "504 Cortez Ave, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Cortez Ave",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 100,
    "address": "784 Cortez Ave, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Cortez Ave",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 101,
    "address": "594 Lois Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Lois Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 102,
    "address": "2726 Bayway Ave, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Bayway Ave",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 103,
    "address": "3089 Los Gatos Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Los Gatos Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 104,
    "address": "2747 Sunset Blvd, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Sunset Blvd",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 105,
    "address": "3054 Sunset Blvd, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Sunset Blvd",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 106,
    "address": "100 Bluff View Dr #403C, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Bluff View Dr",
    "lotOrUnit": "#403C",
    "complexName": "Bluff View Condominiums"
  },
  {
    "sequenceNumber": 107,
    "address": "100 Bluff View Dr #115A, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Bluff View Dr",
    "lotOrUnit": "#115A",
    "complexName": "Bluff View Condominiums"
  },
  {
    "sequenceNumber": 108,
    "address": "100 Bluff View Dr #108A, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Bluff View Dr",
    "lotOrUnit": "#108A",
    "complexName": "Bluff View Condominiums"
  },
  {
    "sequenceNumber": 109,
    "address": "100 Bluff View Dr #103A, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Bluff View Dr",
    "lotOrUnit": "#103A",
    "complexName": "Bluff View Condominiums"
  },
  {
    "sequenceNumber": 110,
    "address": "155 Bluff View Dr #102, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Bluff View Dr",
    "lotOrUnit": "#102",
    "complexName": "Bluff View Condominiums"
  },
  {
    "sequenceNumber": 111,
    "address": "147 Bluff View Dr #401, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Bluff View Dr",
    "lotOrUnit": "#401",
    "complexName": "Bluff View Condominiums"
  },
  {
    "sequenceNumber": 112,
    "address": "139 Bluff View Dr #307, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Bluff View Dr",
    "lotOrUnit": "#307",
    "complexName": "Bluff View Condominiums"
  },
  {
    "sequenceNumber": 113,
    "address": "131 Bluff View Dr #205, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Bluff View Dr",
    "lotOrUnit": "#205",
    "complexName": "Bluff View Condominiums"
  },
  {
    "sequenceNumber": 114,
    "address": "100 Bluff View Dr #302B, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Bluff View Dr",
    "lotOrUnit": "#302B",
    "complexName": "Bluff View Condominiums"
  },
  {
    "sequenceNumber": 115,
    "address": "100 Bluff View Dr #205B, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Bluff View Dr",
    "lotOrUnit": "#205B",
    "complexName": "Bluff View Condominiums"
  },
  {
    "sequenceNumber": 116,
    "address": "100 Bluff View Dr #111B, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Bluff View Dr",
    "lotOrUnit": "#111B",
    "complexName": "Bluff View Condominiums"
  },
  {
    "sequenceNumber": 117,
    "address": "202 Bluff View Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Bluff View Dr",
    "lotOrUnit": null,
    "complexName": "Bluff View Condominiums"
  },
  {
    "sequenceNumber": 118,
    "address": "508 Bluff View Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Bluff View Dr",
    "lotOrUnit": null,
    "complexName": "Bluff View Condominiums"
  },
  {
    "sequenceNumber": 119,
    "address": "23 Sunset Bay Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Sunset Bay Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 120,
    "address": "1 Winston Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Winston Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 121,
    "address": "32 Winston Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Winston Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 122,
    "address": "28 Winston Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Winston Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 123,
    "address": "7 N Pine Cir, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "N Pine Cir",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 124,
    "address": "58 N Pine Cir, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "N Pine Cir",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 125,
    "address": "18 N Pine Cir, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "N Pine Cir",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 126,
    "address": "1737 Eagles Nest Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Eagles Nest Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 127,
    "address": "1725 Eagles Nest Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Eagles Nest Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 128,
    "address": "212 Garden Cir, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Garden Cir",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 129,
    "address": "5 Stonegate Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Stonegate Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 130,
    "address": "1711 Peaceful Ave, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Peaceful Ave",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 131,
    "address": "5 Rosery Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Rosery Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 132,
    "address": "28 Evonaire Cir, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Evonaire Cir",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 133,
    "address": "30 Evonaire Cir, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Evonaire Cir",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 134,
    "address": "1704 Laurie Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Laurie Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 135,
    "address": "2940 W Bay Dr #204, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "W Bay Dr",
    "lotOrUnit": "#204",
    "complexName": "West Bay Manor Apartments"
  },
  {
    "sequenceNumber": 136,
    "address": "2940 W Bay Dr #302, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "W Bay Dr",
    "lotOrUnit": "#302",
    "complexName": "West Bay Manor Apartments"
  },
  {
    "sequenceNumber": 137,
    "address": "2940 W Bay Dr #501, Largo, FL",
    "municipality": "Largo",
    "roadLabel": "W Bay Dr",
    "lotOrUnit": "#501",
    "complexName": "West Bay Manor Apartments"
  },
  {
    "sequenceNumber": 138,
    "address": "130 Indian Rocks Rd S, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Indian Rocks Rd S",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 139,
    "address": "213 Poinciana Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Poinciana Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 140,
    "address": "217 Poinciana Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Poinciana Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 141,
    "address": "113 Poinciana Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Poinciana Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 142,
    "address": "605 Palm Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Palm Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 143,
    "address": "226 Driftwood Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Driftwood Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 144,
    "address": "222 Driftwood Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Driftwood Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 145,
    "address": "109 Driftwood Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Driftwood Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 146,
    "address": "506 Palm Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Palm Dr",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 147,
    "address": "126 Harbor View Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Harbor View Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 148,
    "address": "104 Harbor View Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Harbor View Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 149,
    "address": "50 Harbor View Ln #23, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Harbor View Ln",
    "lotOrUnit": "#23",
    "complexName": "Harbor View Mobile Manor"
  },
  {
    "sequenceNumber": 150,
    "address": "50 Harbor View Ln #27, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Harbor View Ln",
    "lotOrUnit": "#27",
    "complexName": "Harbor View Mobile Manor"
  },
  {
    "sequenceNumber": 151,
    "address": "107 Palmetto Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Palmetto Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 152,
    "address": "111 Palmetto Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Palmetto Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 153,
    "address": "127 Palmetto Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Palmetto Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 154,
    "address": "130 Palmetto Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Palmetto Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 155,
    "address": "119 Crestwood Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Crestwood Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 156,
    "address": "104 Crestwood Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Crestwood Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 157,
    "address": "131 Live Oak Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Live Oak Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 158,
    "address": "203 Live Oak Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Live Oak Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 159,
    "address": "207 Live Oak Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Live Oak Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 160,
    "address": "206 Live Oak Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Live Oak Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 161,
    "address": "213 Live Oak Ln, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Live Oak Ln",
    "lotOrUnit": null,
    "complexName": null
  },
  {
    "sequenceNumber": 162,
    "address": "202 Palm Dr, Belleair Bluffs, FL",
    "municipality": "Belleair Bluffs",
    "roadLabel": "Palm Dr",
    "lotOrUnit": null,
    "complexName": null
  }
];

import { listDeliveryStops } from './server/db.ts';
listDeliveryStops().then(console.log).catch(console.error);

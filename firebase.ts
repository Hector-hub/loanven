import { getDatabase, ref, set} from "firebase/database";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { environment } from "src/environments/environment.prod";

const app = initializeApp(environment.firebaseConfig);
const database =getDatabase(app);
export const analytics = getAnalytics(app);

export default database;


import { initializeTable } from "./config/db"

(async ()=>{
    try{
        await initializeTable();


        console.log('Operation sucessfull')
    }catch(error){
        console.error('Error executing database operation', error)
    }
})();
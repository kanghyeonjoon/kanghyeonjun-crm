'use client';
import {useEffect,useState} from 'react';
import LandingTelemetry from './LandingTelemetry';
import MetaLeadEvent from './MetaLeadEvent';
export default function ReceiptAnalytics(){
 const [received,setReceived]=useState(false);
 useEffect(()=>{try{if(sessionStorage.getItem('mongpd-native-received')==='yes'){sessionStorage.removeItem('mongpd-native-received');setReceived(true);}}catch{/* Analytics never blocks the receipt. */}},[]);
 return received?<><LandingTelemetry /><MetaLeadEvent qualified /></>:null;
}

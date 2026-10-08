import React from 'react';
export default function Logo({small=false}){
 return <div className={'logo tyvon-wordmark iron-wordmark '+(small?'small':'')} aria-label="TYVON"><img src="/brand/iron/mark.svg" alt="" draggable="false"/><span>TYVON</span></div>;
}

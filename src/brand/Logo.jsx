import React from 'react';

export default function Logo({small=false}){
 return <div className={'logo tyvon-wordmark '+(small?'small':'')} aria-label="TYVON">
  <img src="/brand/tyvon-logo-transparent.svg" alt="TYVON" draggable="false" decoding="async"/>
 </div>;
}

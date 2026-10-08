import React from 'react';
export default function Bot({thinking=false}){
 return <div className={'tyvon-bot iron-coach '+(thinking?'is-thinking':'')}><img src="/brand/iron/mark.svg" alt="TYVON, símbolo de supino"/>{thinking&&<span className="bot-thinking-light" aria-hidden="true"/>}</div>;
}

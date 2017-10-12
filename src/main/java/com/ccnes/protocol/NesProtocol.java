package com.ccnes.protocol;

import java.util.Map;

import com.bitsyntax.CCBitsyntax;

public final class NesProtocol {
    private CCBitsyntax bitsyntax;
    public NesProtocol(){
    	this.bitsyntax=new CCBitsyntax("t:1/I,(t){10:{uid/U8},20:{tuid/U8},30:{key:1/I,keyType:1/I,handle:1/I},40:{data},50:{data}}");
    }
    public Map<String, Object>converMsgToMap(byte[] bs){
    	return bitsyntax.convertToMap(bs);
    }
}

<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.10.0" name="village"
         tilewidth="48" tileheight="48"
         tilecount="32" columns="8">
 <image source="village.png" width="384" height="192"/>
  <tile id="8">
   <properties>
    <property name="solid" type="bool" value="true"/>
   </properties>
   <objectgroup draworder="index" id="2">
    <object id="1" x="0" y="0" width="48" height="48"/>
   </objectgroup>
  </tile>
  <tile id="9">
   <properties>
    <property name="solid" type="bool" value="true"/>
   </properties>
   <objectgroup draworder="index" id="2">
    <object id="1" x="0" y="0" width="48" height="48"/>
   </objectgroup>
  </tile>
  <tile id="10">
   <properties>
    <property name="solid" type="bool" value="true"/>
   </properties>
   <objectgroup draworder="index" id="2">
    <object id="1" x="0" y="0" width="48" height="48"/>
   </objectgroup>
  </tile>
  <tile id="11">
   <properties>
    <property name="solid" type="bool" value="true"/>
   </properties>
   <objectgroup draworder="index" id="2">
    <object id="1" x="0" y="0" width="48" height="48"/>
   </objectgroup>
  </tile>
  <tile id="13">
   <properties>
    <property name="solid" type="bool" value="true"/>
   </properties>
   <objectgroup draworder="index" id="2">
    <object id="1" x="0" y="0" width="48" height="48"/>
   </objectgroup>
  </tile>
  <tile id="15">
   <properties>
    <property name="solid" type="bool" value="true"/>
   </properties>
   <objectgroup draworder="index" id="2">
    <object id="1" x="0" y="0" width="48" height="48"/>
   </objectgroup>
  </tile>
  <tile id="16">
   <properties>
    <property name="solid" type="bool" value="true"/>
   </properties>
   <objectgroup draworder="index" id="2">
    <object id="1" x="0" y="0" width="48" height="48"/>
   </objectgroup>
  </tile>
  <tile id="18">
   <properties>
    <property name="solid" type="bool" value="true"/>
   </properties>
   <objectgroup draworder="index" id="2">
    <object id="1" x="0" y="0" width="48" height="48"/>
   </objectgroup>
  </tile>
  <tile id="23">
   <properties>
    <property name="solid" type="bool" value="true"/>
   </properties>
   <objectgroup draworder="index" id="2">
    <object id="1" x="0" y="0" width="48" height="48"/>
   </objectgroup>
  </tile>
  <tile id="24">
   <properties>
    <property name="solid" type="bool" value="true"/>
   </properties>
   <objectgroup draworder="index" id="2">
    <object id="1" x="0" y="0" width="48" height="48"/>
   </objectgroup>
  </tile>
  <tile id="27">
   <properties>
    <property name="solid" type="bool" value="true"/>
   </properties>
   <objectgroup draworder="index" id="2">
    <object id="1" x="0" y="0" width="48" height="48"/>
   </objectgroup>
  </tile>
  <tile id="28">
   <properties>
    <property name="solid" type="bool" value="true"/>
   </properties>
   <objectgroup draworder="index" id="2">
    <object id="1" x="0" y="0" width="48" height="48"/>
   </objectgroup>
  </tile>
  <tile id="6">
   <properties>
    <property name="solid" type="bool" value="true"/>
   </properties>
   <objectgroup draworder="index" id="2">
    <object id="1" x="0" y="0" width="48" height="48"/>
   </objectgroup>
  </tile>

  <wangsets>
   <wangset name="Grass" type="corner" tile="0">
    <wangcolor name="Grass" color="#4a7c3e" tile="0" probability="1"/>
    <wangcolor name="Path"  color="#b49664" tile="2" probability="0.3"/>
    <wangtile tileid="0" wangid="0,1,0,1,0,1,0,1"/>
    <wangtile tileid="1" wangid="0,1,0,1,0,1,0,1"/>
    <wangtile tileid="2" wangid="0,2,0,2,0,2,0,2"/>
    <wangtile tileid="3" wangid="0,2,0,2,0,2,0,2"/>
   </wangset>
   <wangset name="Water" type="corner" tile="5">
    <wangcolor name="Shallow" color="#64b4dc" tile="5" probability="1"/>
    <wangcolor name="Deep"    color="#2864a0" tile="6" probability="0.5"/>
    <wangtile tileid="5" wangid="0,1,0,1,0,1,0,1"/>
    <wangtile tileid="6" wangid="0,2,0,2,0,2,0,2"/>
   </wangset>
  </wangsets>
</tileset>

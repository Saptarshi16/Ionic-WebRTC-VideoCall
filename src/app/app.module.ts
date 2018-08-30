import { HttpClientModule } from '@angular/common/http';
import { DisplayPage } from './../pages/display/display';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { WebsocketServiceProvider } from '../providers/websocket-service/websocket-service';
import { FormsModule } from '@angular/forms';
import { MediaProvider } from '../providers/media/media';
import { ToggleCameraComponent } from '../components/toggle-camera/toggle-camera';
import { ConfigurationProvider } from '../providers/configuration/configuration';
import { ChatComponent } from '../components/chat/chat';
import { PeerConnectionsProvider } from '../providers/peer-connections/peer-connections';
import { TooltipsModule } from 'ionic-tooltips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavController } from 'ionic-angular';
import { Camera } from 'ionic-native';
import { Media, MediaObject } from '@ionic-native/media';
@NgModule({
  declarations: [
    MyApp,
    HomePage,
    DisplayPage,
    ToggleCameraComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    IonicModule,
    IonicModule.forRoot(MyApp),
    TooltipsModule,
    BrowserAnimationsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    DisplayPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    WebsocketServiceProvider,
    MediaProvider,
    //ModProvider,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ConfigurationProvider,
    Camera
    //  WebsocketServiceProvider,
  ]
})
export class AppModule { }

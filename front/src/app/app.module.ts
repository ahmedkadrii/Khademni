import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ProfileComponent } from './profile/profile.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialogModule } from '@angular/material/dialog';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthGuard } from './auth.guard';
import { HomeComponent } from './home/home.component';
import { JoblistComponent } from './joblist/joblist.component';
import { FooterComponent } from './footer/footer.component';
import { ApplicantsComponent } from './applicants/applicants.component';
import { DialogComponent } from './dialog/dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Add this import
import { ToastrModule } from 'ngx-toastr';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { JobDetailsModalComponent } from './job-details-modal/job-details-modal.component';
import { AddJobModalComponent } from './add-job-modal/add-job-modal.component';
import { EditJobModalComponent } from './edit-job-modal/edit-job-modal.component';
import { TosComponent } from './tos/tos.component';
import { EmailConfirmationComponent } from './email-confirmation/email-confirmation.component';

import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { CountUpModule } from 'ngx-countup';
import { CountUpDirective } from './count-up.directive';
import { NotificationComponent } from './notification/notification.component';
import { BookmarksComponent } from './bookmarks/bookmarks.component';
import { EnterpriseRegisterComponent } from './enterprise-register/enterprise-register.component';
import { ConversationsComponent } from './conversations/conversations.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { AdminUserListComponent } from './admin-user-list/admin-user-list.component';
import { AdminEnterpriseListComponent } from './admin-enterprise-list/admin-enterprise-list.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { ContactComponent } from './contact/contact.component';
import { AdminJobListComponent } from './admin-job-list/admin-job-list.component';





@NgModule({ declarations: [
        AppComponent,
        RegisterComponent,
        LoginComponent,
        DashboardComponent,
        ProfileComponent,
        NavbarComponent,
        HomeComponent,
        JoblistComponent,
        FooterComponent,
        ApplicantsComponent,
        DialogComponent,
        PageNotFoundComponent,
        ForgotPasswordComponent,
        JobDetailsModalComponent,
        AddJobModalComponent,
        EditJobModalComponent,
        TosComponent,
        EmailConfirmationComponent,
        PrivacyPolicyComponent,
        ResetPasswordComponent,
        CountUpDirective,
        NotificationComponent,
        BookmarksComponent,
        EnterpriseRegisterComponent,
        ConversationsComponent,
        AboutUsComponent,
        AdminUserListComponent,
        AdminEnterpriseListComponent,
        UnauthorizedComponent,
        ContactComponent,
        AdminJobListComponent,
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA], imports: [BrowserModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatIconModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatToolbarModule,
        MatButtonModule,
        MatMenuModule,
        NgbModule,
        CountUpModule,
        ToastrModule.forRoot()], providers: [
        provideAnimationsAsync(),
        AuthGuard,
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule { }

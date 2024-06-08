import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { JoblistComponent } from './joblist/joblist.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from './auth.guard';
import { AuthGuardLoggedIn } from './auth-guard-logged-in.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { TosComponent } from './tos/tos.component';
import { ApplicantsComponent } from './applicants/applicants.component';
import { EmailConfirmationComponent } from './email-confirmation/email-confirmation.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { BookmarksComponent } from './bookmarks/bookmarks.component';
import { EnterpriseRegisterComponent } from './enterprise-register/enterprise-register.component';
import { ConversationsComponent } from './conversations/conversations.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminUserListComponent } from './admin-user-list/admin-user-list.component';
import { AdminEnterpriseListComponent } from './admin-enterprise-list/admin-enterprise-list.component';
import { AdminGuard } from './admin.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { ContactComponent } from './contact/contact.component';
import { AdminJobListComponent } from './admin-job-list/admin-job-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'jobs', component: JoblistComponent },
  { path: 'login', component: LoginComponent, canActivate: [AuthGuardLoggedIn] },
  { path: 'register', component: RegisterComponent, canActivate: [AuthGuardLoggedIn] },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'enterprise/register', component: EnterpriseRegisterComponent, canActivate: [AuthGuardLoggedIn] },
  { path: 'conversations', component: ConversationsComponent, canActivate: [AuthGuard] },
  { path: 'messages/:userId', component: ConversationsComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'a/users', component: AdminUserListComponent, canActivate: [AdminGuard]},
  { path: 'a/enterprises', component: AdminEnterpriseListComponent, canActivate: [AdminGuard]},
  { path: 'a/jobs', component: AdminJobListComponent, canActivate: [AdminGuard]},
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'tos', component: TosComponent },
  { path: 'bookmarks', component: BookmarksComponent, canActivate: [AuthGuard] },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'applicants/:jobId', component: ApplicantsComponent, canActivate: [AuthGuard] },
  { path: 'reset-password/:resetToken', component: ResetPasswordComponent },
  { path: 'confirm/:token', component: EmailConfirmationComponent },
  { path: 'contact', component: ContactComponent },
  { path: ':username', component: ProfileComponent },
  

  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

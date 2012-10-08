using Facebook;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Dynamic;
using System.IO;
using System.Linq;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;
using appMobiFacebookTemplate.Helpers;

// The User Control item template is documented at http://go.microsoft.com/fwlink/?LinkId=234236

namespace appMobiFacebookTemplate.UserControls
{
    public partial class AppMobiView : UserControl
    {        /// <summary>
        /// Extended permissions is a comma separated list of permissions to ask the user.
        /// </summary>
        /// <remarks>
        /// For extensive list of available extended permissions refer to 
        /// https://developers.facebook.com/docs/reference/api/permissions/
        /// </remarks>
        private const string ExtendedPermissions = "user_about_me,read_stream,publish_stream";

        private ExpandoObject FBUser;

        private readonly FacebookClient _fb = new FacebookClient();

        public AppMobiView()
        {
            this.InitializeComponent();
        }

        public WebView Browser
        {
            get
            {
                return webView;
            }
        }

        protected Uri _startPageUri = null;
        public Uri StartPageUri
        {
            get
            {
                if (_startPageUri == null)
                {
                    // default
                    return new Uri("ms-appx-web:///html/index.html");
                }
                else
                {
                    return _startPageUri;
                }
            }
            set
            {
                _startPageUri = value;
            }
        }

        void webView_ScriptNotify(object sender, NotifyEventArgs e)
        {
            string commandStr = e.Value;

            if (commandStr.IndexOf("MESSAGE") == 0)
            {
                commandStr = commandStr.Replace("MESSAGE:", "");
                Debug.WriteLine("MESSAGE :: " + commandStr);
                return;
            }

            var dict = commandStr.Split(new[] { '&' }, StringSplitOptions.RemoveEmptyEntries)
               .Select(part => part.Split('='))
               .ToDictionary(split => split[0], split => split[1]);

            if (dict["type"].Equals("FBLogin"))
            {
                //commandStr = commandStr.Replace("FBLogin:", "");
                Login(dict["app_id"], (dict["scope"].Length > 1 && dict["scope"] != null) ? dict["scope"] : ExtendedPermissions);
            }
            else if (dict["type"].Equals("FBPost"))
            {
                commandStr = commandStr.Replace("MESSAGE:", "");
                Debug.WriteLine("MESSAGE :: " + commandStr);
            }
            else if (dict["type"].Equals("FBUI"))
            {
                commandStr = commandStr.Replace("MESSAGE:", "");
                Debug.WriteLine("MESSAGE :: " + commandStr);

                if (dict["method"].Equals("feed"))
                {
                    PostToWall(dict);
                }
            }
            else if (dict["type"].Equals("FBAPI"))
            {
                commandStr = commandStr.Replace("MESSAGE:", "");
                Debug.WriteLine("MESSAGE :: " + commandStr);

                //if (dict["method"].Equals("feed"))
                //{
                    GetUserData(dict);
                //}
            }
            else if (dict["type"].Equals("FBLogout"))
            {
                Logout();
            }
        }

        public void Login(string app_id, string permissions)
        {
            var loginUrl = GetFacebookLoginUrl(app_id, permissions);

            List<Uri> allowedUris = new List<Uri>();
            allowedUris.Add(loginUrl);
            webViewFB.AllowedScriptNotifyUris = allowedUris;

            webViewFB.Navigate(loginUrl);
            webViewFB.Visibility = Windows.UI.Xaml.Visibility.Visible;
        }

        public void Logout()
        {
            var logoutUrl = GetFacebookLogoutUrl("http://www.appmobi.com", _fb.AccessToken, "1");

            List<Uri> allowedUris = new List<Uri>();
            allowedUris.Add(logoutUrl);
            webViewFB.AllowedScriptNotifyUris = allowedUris;

            webViewFB.Navigate(logoutUrl);
            webViewFB.Visibility = Windows.UI.Xaml.Visibility.Visible;

            String js = "javascript: var e = document.createEvent('Events');e.initEvent('appMobi.facebook.logout',true,true);e.success=true;document.dispatchEvent(e);";
            webView.InvokeScript("execScript", new string[] { js });
        }

        private Uri GetFacebookLoginUrl(string appId, string extendedPermissions)
        {
            dynamic parameters = new ExpandoObject();
            parameters.client_id = appId;
            parameters.redirect_uri = "https://www.facebook.com/connect/login_success.html";
            parameters.response_type = "token";
            parameters.display = "popup";

            // add the 'scope' parameter only if we have extendedPermissions.
            if (!string.IsNullOrWhiteSpace(extendedPermissions))
            {
                // A comma-delimited list of permissions
                parameters.scope = extendedPermissions;
            }

            return _fb.GetLoginUrl(parameters);
        }

        private Uri GetFacebookLogoutUrl(string next, string access_token, string confirm)
        {
            dynamic parameters = new ExpandoObject();
            parameters.next = next;
            parameters.access_token = access_token;
            parameters.confirm = confirm;

            return _fb.GetLogoutUrl(parameters);
        }

        private string _lastMessageId;
        private async void GetUserData(Dictionary<string, string> param)
        {

            //dynamic result = await _fb.GetTaskAsync("me", parameters);
            //parameters = new ExpandoObject();
            //parameters.id = result.id;
            //parameters.access_token = accessToken;


            try
            {
                string path = "/me";
                dynamic parameters = new ExpandoObject();
                //if (param.Keys.Contains<string>("name")) { parameters.name = param["name"]; }
                //if (param.Keys.Contains<string>("caption")) { parameters.caption = param["caption"]; }
                //if (param.Keys.Contains<string>("link")) { parameters.link = param["link"]; }
                //if (param.Keys.Contains<string>("picture")) { parameters.picture = param["picture"]; }
                if (param.Keys.Contains<string>("path")) { path = param["path"]; }

                Facebook.JsonObject result = await _fb.GetTaskAsync(path, parameters);

                string js = "javascript: var e = document.createEvent('Events');e.initEvent('appMobi.facebook.request.response',true,true);e.success=true;e.raw='"+result.ToString()+"';e.data={};try{e.data=JSON.parse(e.raw);}catch(ex){}e.error='';document.dispatchEvent(e);";
                webView.InvokeScript("execScript", new string[] { js });
            }
            catch (FacebookApiException ex)
            {
                // handle error message
                if (ex.ErrorCode == 2500)
                {
                    // user not logged in.
                    ScriptResponse sr = ErrorHandler.setupErrorResponse(ErrorsEnum.E000203);
                    //string js = "(function(){ AppMobi.facebook.internal.handleResponse('request.response',false," + sr.ToJson() + ")})();";
                    string js = string.Format("javascript: var e = document.createEvent('Events');e.initEvent('appMobi.facebook.request.response',true,true);e.success=false;e.error='{0}';e.raw='';e.data={};document.dispatchEvent(e);", sr.Message);
                    webView.InvokeScript("execScript", new string[] { js });
                }
                else
                {
                    // user not logged in.
                    ScriptResponse sr = ErrorHandler.setupErrorResponse(ErrorsEnum.E000202);
                    //string js = "(function(){ AppMobi.facebook.internal.handleResponse('request.response',false," + sr.ToJson() + ")})();";
                    string js = string.Format("javascript: var e = document.createEvent('Events');e.initEvent('appMobi.facebook.request.response',true,true);e.success=false;e.error='{0}';e.raw='';e.data={};document.dispatchEvent(e);", ex.Message);
                    webView.InvokeScript("execScript", new string[] { js });
                }
            }
        }
        private async void PostToWall(Dictionary<string, string> param)
        {
            try
            {
                dynamic parameters = new ExpandoObject();
                if (param.Keys.Contains<string>("name")) { parameters.name = param["name"]; }
                if (param.Keys.Contains<string>("caption")) { parameters.caption = param["caption"]; }
                if (param.Keys.Contains<string>("link")) { parameters.link = param["link"]; }
                if (param.Keys.Contains<string>("picture")) { parameters.picture = param["picture"]; }

                dynamic result = await _fb.PostTaskAsync("me/feed", parameters);
                _lastMessageId = result.id;

                ScriptResponse sr = new ScriptResponse { Message = "Facebook Post Successful", ResponseCode = "" };
                string js = "(function(){ AppMobi.facebook.internal.handleResponse('dialog.complete',true," + sr.ToJson() + ")})();";
                webView.InvokeScript("execScript", new string[] { js });
            }
            catch (FacebookApiException ex)
            {
                // handle error message
                if (ex.ErrorCode == 2500)
                {
                    // user not logged in.
                    ScriptResponse sr = ErrorHandler.setupErrorResponse(ErrorsEnum.E000201);
                    string js = string.Format("javascript: var e = document.createEvent('Events');e.initEvent('appMobi.facebook.request.response',true,true);e.success=false;e.error='{0}';e.raw='';e.data={};document.dispatchEvent(e);", sr.Message);
                    webView.InvokeScript("execScript", new string[] { js });
                }
                else
                {
                    ScriptResponse sr = ErrorHandler.setupErrorResponse(ErrorsEnum.E000200);
                    //ScriptResponse sr = new ScriptResponse { Message = "Facebook Post Failed", ResponseCode = "" };
                    string js = string.Format("javascript: var e = document.createEvent('Events');e.initEvent('appMobi.facebook.request.response',true,true);e.success=false;e.error='{0}';e.raw='';e.data={};document.dispatchEvent(e);", ex.Message);
                    webView.InvokeScript("execScript", new string[] { js });
                }
            }
        }

        private void webView_NavigationFailed(object sender, WebViewNavigationFailedEventArgs e)
        {
        }

        private void webView_Loaded(object sender, RoutedEventArgs e)
        {
            List<Uri> allowedUris = new List<Uri>();
            allowedUris.Add(StartPageUri);
            webView.AllowedScriptNotifyUris = allowedUris;

            webView.Navigate(StartPageUri);

        }

        private void webView_LoadCompleted(object sender, NavigationEventArgs e)
        {
            FacebookOAuthResult oauthResult;
            if (!_fb.TryParseOAuthCallbackUrl(e.Uri, out oauthResult))
            {
                return;
            }

            if (oauthResult.IsSuccess)
            {
                var accessToken = oauthResult.AccessToken;
                LoginSucceded(accessToken);
            }
            else
            {
                // user cancelled
                string js = "javascript: var e = document.createEvent('Events');e.initEvent('appMobi.facebook.request.response',true,true);e.success=false;e.error='login failed';e.raw='';e.data={};document.dispatchEvent(e);";
                webView.InvokeScript("execScript", new string[] { js });
            }
        }

        private async void LoginSucceded(string accessToken)
        {
            dynamic parameters = new ExpandoObject();
            parameters.access_token = accessToken;
            parameters.fields = "id";

            dynamic result = await _fb.GetTaskAsync("me", parameters);
            //dynamic FBUser = new ExpandoObject();
            _fb.AccessToken = accessToken;

            //ScriptResponse sr = new ScriptResponse { Message = "Facebook Login Successful", ResponseCode = "", token = accessToken };
            //string js = "(function(){ AppMobi.facebook.internal.handleResponse('login',true," + sr.ToJson() + ")})();";
            string js = "javascript: var e = document.createEvent('Events');e.initEvent('appMobi.facebook.login',true,true);e.success=true;e.cancelled=false;e.token='" + accessToken + "';document.dispatchEvent(e);";
            webView.InvokeScript("execScript", new string[] { js });

            //Frame.Navigate(typeof(FacebookInfoPage), (object)parameters);
            webViewFB.Visibility = Windows.UI.Xaml.Visibility.Collapsed;
        }
    }
}

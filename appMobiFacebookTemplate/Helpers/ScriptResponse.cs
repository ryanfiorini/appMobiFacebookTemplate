using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AppMobiWindows8FacebookTemplate.Helpers
{
    public class ScriptResponse
    {
        public string ResponseCode { get; set; }
        public string Message { get; set; }
        public string token { get; set; }
        //public Facebook.JsonObject FBResult { get; set; }
        public string FBResult { get; set; }
    }
}

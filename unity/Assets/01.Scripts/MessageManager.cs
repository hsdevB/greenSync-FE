using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Runtime.InteropServices;
using TMPro;
using UnityEngine;

//유니티와 React의 통신을 위한 데이터 클래스
public class UnityDataMessage
{
    public string name; //어떤 데이터인지 설명하는 부분 (Enum으로 바꾸어 쓰도록 )
    public JObject data; //실제 데이터들
}

public class MessageManager : MonoBehaviour
{
    [SerializeField] private TextMeshProUGUI txt_ReceiveInfo;

    //앞서 적어준 .jslib의 함수이름과 일치해야 한다.
    [DllImport("__Internal")]
    private static extern void SendMessageToReact(string msg);
    /* 이게 우리의 .jslib 파일 이었다.
      mergeInto(LibraryManager.library, {
    SendMessageToReact : function (msg){
        window.dispatchReactUnityEvent(
            "OnMessageReceived",
            UTF8ToString(msg)
                )
            },
        })
     */

    public void ReceiveMessage(string json)
    {
        UnityDataMessage jsonData = JsonConvert.DeserializeObject<UnityDataMessage>(json);

        Debug.Log(jsonData);

        JObject jobj = jsonData.data;
        txt_ReceiveInfo.text = $"Receive Data : {jsonData}";

        Debug.Log($"Event Name : {jsonData.name}  Data : {jobj}");
    }

    private void SendMessage(string n, JObject data)
    {
        var json = new JObject();

        json.Add("name", n);
        json.Add("data", data);

        Debug.Log("SendMessage To React");
        SendMessageToReact(json.ToString());
    }

    public void OnButton_TestSend()
    {
        JObject test = new JObject();
        test.Add("ToReact", "myTest");
        test.Add("ToReact2", "myTest2");
        SendMessage("IamdduR", test);
    }
}
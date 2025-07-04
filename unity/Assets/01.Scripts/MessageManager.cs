using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Runtime.InteropServices;
using TMPro;
using UnityEngine;

//����Ƽ�� React�� ����� ���� ������ Ŭ����
public class UnityDataMessage
{
    public string name; //� ���������� �����ϴ� �κ� (Enum���� �ٲپ� ������ )
    public JObject data; //���� �����͵�
}

public class MessageManager : MonoBehaviour
{
    [SerializeField] private TextMeshProUGUI txt_ReceiveInfo;

    //�ռ� ������ .jslib�� �Լ��̸��� ��ġ�ؾ� �Ѵ�.
    [DllImport("__Internal")]
    private static extern void SendMessageToReact(string msg);
    /* �̰� �츮�� .jslib ���� �̾���.
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
using UnityEngine;
using System.Runtime.InteropServices;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

public class UnityDataMessage
{
    public string name;
    public JObject data;
}

public class MessageManager : MonoBehaviour
{
    public GameObject fanObject; // �� ȸ�� ���
    public Light ledLight;       // �ϻ緮 ������ ����Ʈ
    public Material waterShaderMaterial; // �޼� �帧 ǥ���� ��Ƽ����
    public GameObject temperatureUI; // �µ� �ؽ�Ʈ UI
    public GameObject humidityUI;    // ���� �ؽ�Ʈ UI
    public Material daySkybox;
    public Material nightSkybox;

    private bool isWatering = false;
    private float wateringTimer = 0f;

    [DllImport("__Internal")]
    private static extern void SendMessageToReact(string msg);

    public void ReceiveMessage(string json)
    {
        UnityDataMessage message = JsonConvert.DeserializeObject<UnityDataMessage>(json);
        JObject data = message.data;

        switch (message.name)
        {
            case "envInfo":
                // �µ�/���� ǥ��
                string temp = data["temperature"].ToString();
                string humid = data["humidity"].ToString();
                temperatureUI.GetComponent<TextMesh>().text = $"�µ�: {temp}��C";
                humidityUI.GetComponent<TextMesh>().text = $"����: {humid}%";
                break;

            case "startWater":
                // �޼� ����
                isWatering = true;
                wateringTimer = 5f; // 5�� ���� �� �帧 ǥ��
                break;

            case "toggleDayNight":
                bool isDay = data["isDay"].ToObject<bool>();
                RenderSettings.skybox = isDay ? daySkybox : nightSkybox;
                DynamicGI.UpdateEnvironment(); // ������ ��� �ݿ�
                break;

            case "ledLevel":
                int level = data["level"].ToObject<int>();
                ledLight.intensity = level * 0.5f; // 0 ~ 1.5
                break;

            case "fanStatus":
                bool isFanOn = data["status"].ToObject<bool>();
                fanObject.SetActive(isFanOn);
                break;

            default:
                Debug.Log("Unknown message received");
                break;
        }
    }

    void Update()
    {
        if (isWatering)
        {
            wateringTimer -= Time.deltaTime;
            if (wateringTimer <= 0f)
            {
                isWatering = false;
                waterShaderMaterial.SetFloat("_FlowSpeed", 0f);
            }
            else
            {
                waterShaderMaterial.SetFloat("_FlowSpeed", 1.0f);
            }
        }

        // �� ȸ��
        if (fanObject.activeSelf)
        {
            fanObject.transform.Rotate(Vector3.forward * 200 * Time.deltaTime);
        }
    }
}

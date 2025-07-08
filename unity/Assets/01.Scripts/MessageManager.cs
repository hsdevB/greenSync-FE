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
    public GameObject fanObject; // 팬 회전 대상
    public Light ledLight;       // 일사량 조절용 라이트
    public Material waterShaderMaterial; // 급수 흐름 표현용 머티리얼
    public GameObject temperatureUI; // 온도 텍스트 UI
    public GameObject humidityUI;    // 습도 텍스트 UI
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
                // 온도/습도 표시
                string temp = data["temperature"].ToString();
                string humid = data["humidity"].ToString();
                temperatureUI.GetComponent<TextMesh>().text = $"온도: {temp}°C";
                humidityUI.GetComponent<TextMesh>().text = $"습도: {humid}%";
                break;

            case "startWater":
                // 급수 시작
                isWatering = true;
                wateringTimer = 5f; // 5초 동안 물 흐름 표현
                break;

            case "toggleDayNight":
                bool isDay = data["isDay"].ToObject<bool>();
                RenderSettings.skybox = isDay ? daySkybox : nightSkybox;
                DynamicGI.UpdateEnvironment(); // 라이팅 즉시 반영
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

        // 팬 회전
        if (fanObject.activeSelf)
        {
            fanObject.transform.Rotate(Vector3.forward * 200 * Time.deltaTime);
        }
    }
}

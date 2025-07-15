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
    public Light[] ledLights;       // 일사량 조절용 라이트
    public ParticleSystem[] waterParticle;  // 급수 흐름 표현용 머티리얼
    public GameObject temperatureUI; // 온도 텍스트 UI
    public GameObject humidityUI;    // 습도 텍스트 UI
    public Material daySkybox;
    public Material nightSkybox;

    private bool isFanOn = false;

    private bool isWatering = false;
    private float wateringTimer = 0f;
    public float flowDuration = 5f;
    public float flowSpeed = 1f;
    private Vector2 startOffset;


    [DllImport("__Internal")]
    private static extern void SendMessageToReact(string msg);

    public void ReceiveMessage(string json)
    {
        UnityDataMessage jsonData = JsonConvert.DeserializeObject<UnityDataMessage>(json);
        JObject jobj = jsonData.data;

        Debug.Log($"Event name: {jsonData.name}, Data: {jobj}");

        switch (jsonData.name)
        {
            case "envInfo":
                // 온도/습도 표시
                string temp = jobj["temperature"].ToString();
                string humid = jobj["humidity"].ToString();
                temperatureUI.GetComponent<TextMesh>().text = $"온도: {temp}°C";
                humidityUI.GetComponent<TextMesh>().text = $"습도: {humid}%";
                break;

            case "startWater":
                // 급수 시작
                isWatering = true;
                wateringTimer = 5f; // 5초 동안 물 흐름 표현

                isWatering = true;
                wateringTimer = flowDuration;
                foreach (ParticleSystem wp in waterParticle)
                    wp.Play();
                break;

            case "toggleDayNight": // 시간 정보 받아와서 처리하도록 바꾸기
                bool isDay = jobj["isDay"].ToObject<bool>();
                RenderSettings.skybox = isDay ? daySkybox : nightSkybox;
                DynamicGI.UpdateEnvironment(); // 라이팅 즉시 반영
                break;

            case "ledLevel":
                int level = jobj["level"].ToObject<int>();
                foreach (Light light in ledLights)
                    if (light != null)
                        light.intensity = level * 0.5f; // 0 ~ 1.5
                break;

            case "fanStatus":
                isFanOn = jobj["status"].ToObject<bool>();
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
                foreach (ParticleSystem wp in waterParticle)
                    wp.Stop();
            }
        }

        // 팬 회전
        if (isFanOn)
        {
            fanObject.transform.Rotate(Vector3.forward * 200 * Time.deltaTime);
        }
    }
}

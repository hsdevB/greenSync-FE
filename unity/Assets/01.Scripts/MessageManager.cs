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
    public Light[] ledLights;       // �ϻ緮 ������ ����Ʈ
    public ParticleSystem[] waterParticle;  // �޼� �帧 ǥ���� ��Ƽ����
    public GameObject temperatureUI; // �µ� �ؽ�Ʈ UI
    public GameObject humidityUI;    // ���� �ؽ�Ʈ UI
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
                // �µ�/���� ǥ��
                string temp = jobj["temperature"].ToString();
                string humid = jobj["humidity"].ToString();
                temperatureUI.GetComponent<TextMesh>().text = $"�µ�: {temp}��C";
                humidityUI.GetComponent<TextMesh>().text = $"����: {humid}%";
                break;

            case "startWater":
                // �޼� ����
                isWatering = true;
                wateringTimer = 5f; // 5�� ���� �� �帧 ǥ��

                isWatering = true;
                wateringTimer = flowDuration;
                foreach (ParticleSystem wp in waterParticle)
                    wp.Play();
                break;

            case "toggleDayNight": // �ð� ���� �޾ƿͼ� ó���ϵ��� �ٲٱ�
                bool isDay = jobj["isDay"].ToObject<bool>();
                RenderSettings.skybox = isDay ? daySkybox : nightSkybox;
                DynamicGI.UpdateEnvironment(); // ������ ��� �ݿ�
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

        // �� ȸ��
        if (isFanOn)
        {
            fanObject.transform.Rotate(Vector3.forward * 200 * Time.deltaTime);
        }
    }
}

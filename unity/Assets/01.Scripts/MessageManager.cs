using UnityEngine;
using System.Runtime.InteropServices;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using TMPro;

[System.Serializable]
public class UnityDataMessage
{
    public string name;
    public string data; // JObject ��� string���� ����
}

public class MessageManager : MonoBehaviour
{
    public GameObject fanObject; // �� ȸ�� ���
    public Light[] ledLights;       // �ϻ緮 ������ ����Ʈ
    public ParticleSystem[] waterParticle;  // �޼� �帧 ǥ���� ��ƼŬ
    public GameObject temperatureUI; // �µ� �ؽ�Ʈ UI
    public GameObject humidityUI;    // ���� �ؽ�Ʈ UI
    public Material daySkybox;
    public Material nightSkybox;

    private bool isFanOn = false;
    private bool isWatering = false;
    private float wateringTimer = 0f;
    public float flowDuration = 10f;
    public float flowSpeed = 1f;
    private Vector2 startOffset;

    [DllImport("__Internal")]
    private static extern void SendMessageToReact(string msg);

    void Start()
    {
        // ������Ʈ Ȯ��
        if (temperatureUI != null)
        {
            Debug.Log("Temperature UI assigned");
        }
        else
        {
            Debug.LogError("Temperature UI is not assigned!");
        }

        if (humidityUI != null)
        {
            Debug.Log("Humidity UI assigned");
        }
        else
        {
            Debug.LogError("Humidity UI is not assigned!");
        }

        if (ledLights != null && ledLights.Length > 0)
        {
            Debug.Log($"LED Lights assigned: {ledLights.Length} lights");
        }
        else
        {
            Debug.LogError("LED Lights array is not assigned or empty!");
        }

        // �ʱ�ȭ �� ��� ��ƼŬ �ý��� ����
        if (waterParticle != null)
        {
            foreach (ParticleSystem wp in waterParticle)
            {
                if (wp != null)
                {
                    wp.Stop();
                    wp.Clear();
                }
            }
        }

        // �ʱ� ���� ����
        isWatering = false;
        wateringTimer = 0f;
    }

    public void ReceiveMessage(string json)
    {
        try
        {
            Debug.Log($"Received JSON: {json}");

            // JSON �Ľ� �õ�
            UnityDataMessage jsonData = JsonConvert.DeserializeObject<UnityDataMessage>(json);

            if (jsonData == null)
            {
                Debug.LogError("Failed to deserialize JSON message");
                return;
            }

            Debug.Log($"Event name: {jsonData.name}");

            // data�� null�� �ƴ� ��쿡�� JObject�� �Ľ�
            JObject jobj = null;
            if (!string.IsNullOrEmpty(jsonData.data))
            {
                try
                {
                    jobj = JObject.Parse(jsonData.data);
                }
                catch (Exception e)
                {
                    Debug.LogError($"Failed to parse data as JObject: {e.Message}");
                    return;
                }
            }

            ProcessMessage(jsonData.name, jobj);
        }
        catch (Exception e)
        {
            Debug.LogError($"Error in ReceiveMessage: {e.Message}");
        }
    }

    private void ProcessMessage(string eventName, JObject jobj)
    {
        switch (eventName)
        {
            case "tempControl":
                if (jobj != null && jobj["value"] != null) // "temperature" -> "value"�� ����
                {
                    string temp = jobj["value"].ToString();
                    Debug.Log($"Temperature updated to: {temp}��C");

                    if (temperatureUI != null)
                    {
                        Debug.Log("Temperature UI found, attempting to update text");
                        // TextMeshProGUI ������Ʈ (UI Canvas��)
                        TextMeshProUGUI textMeshProUI = temperatureUI.GetComponent<TextMeshProUGUI>();
                        if (textMeshProUI != null)
                        {
                            textMeshProUI.text = $"{temp}��C";
                            Debug.Log($"TextMesh updated: {textMeshProUI.text}");
                        }
                        else
                        {
                            // TextMeshPro ������Ʈ (3D World Space��)
                            TextMeshPro textMeshPro = temperatureUI.GetComponent<TextMeshPro>();
                            if (textMeshPro != null)
                            {
                                textMeshPro.text = $"�µ�: {temp}��C";
                                Debug.Log($"UI Text updated: {textMeshPro.text}");
                            }
                            else
                            {
                                // �⺻ UI Text ������Ʈ (Legacy)
                                UnityEngine.UI.Text legacyText = temperatureUI.GetComponent<UnityEngine.UI.Text>();
                                if (legacyText != null)
                                {
                                    legacyText.text = $"�µ�: {temp}��C";
                                    Debug.Log($"Legacy UI Text updated: {legacyText.text}");
                                }
                                else
                                {
                                    Debug.LogError("No TextMeshProUGUI, TextMeshPro, or UI Text component found on temperatureUI");
                                }
                            }
                        }
                    }
                    else
                    {
                        Debug.LogError("temperatureUI is null");
                    }
                }
                break;

            case "humidControl":
                if (jobj != null && jobj["value"] != null) // "humidity" -> "value"�� ����
                {
                    string humid = jobj["value"].ToString();
                    Debug.Log($"Humidity updated to: {humid}%");

                    if (humidityUI != null)
                    {
                        Debug.Log("Humidity UI found, attempting to update text");
                        // TextMeshProUGUI ������Ʈ (UI Canvas��)
                        TextMeshProUGUI textMeshProUI = humidityUI.GetComponent<TextMeshProUGUI>();
                        if (textMeshProUI != null)
                        {
                            textMeshProUI.text = $"{humid}%";
                            Debug.Log($"TextMesh updated: {textMeshProUI.text}");
                        }
                        else
                        {
                            // TextMeshPro ������Ʈ (3D World Space��)
                            TextMeshPro textMeshPro = humidityUI.GetComponent<TextMeshPro>();
                            if (textMeshPro != null)
                            {
                                textMeshPro.text = $"����: {humid}%";
                                Debug.Log($"UI Text updated: {textMeshPro.text}");
                            }
                            else
                            {
                                // �⺻ UI Text ������Ʈ (Legacy)
                                UnityEngine.UI.Text legacyText = humidityUI.GetComponent<UnityEngine.UI.Text>();
                                if (legacyText != null)
                                {
                                    legacyText.text = $"����: {humid}%";
                                    Debug.Log($"Legacy UI Text updated: {legacyText.text}");
                                }
                                else
                                {
                                    Debug.LogError("No TextMeshProUGUI, TextMeshPro, or UI Text component found on humidityUI");
                                }
                            }
                        }
                    }
                    else
                    {
                        Debug.LogError("humidityUI is null");
                    }
                }
                break;

            case "startWater":
                if (jobj != null && jobj["status"] != null)
                {
                    bool waterStatus = jobj["status"].ToObject<bool>();
                    Debug.Log($"Water control: {waterStatus}");

                    // �޼� ���� ����: ��û�� true�̰� ���� �޼� ���� �ƴ� ����
                    if (waterStatus && !isWatering)
                    {
                        isWatering = true;
                        wateringTimer = flowDuration;
                        Debug.Log("Starting water flow");

                        if (waterParticle != null)
                        {
                            foreach (ParticleSystem wp in waterParticle)
                            {
                                if (wp != null)
                                {
                                    wp.Play();
                                }
                            }
                        }
                    }
                    // �޼� ���� ��û
                    else if (!waterStatus && isWatering)
                    {
                        isWatering = false;
                        wateringTimer = 0f;
                        Debug.Log("Stopping water flow");

                        if (waterParticle != null)
                        {
                            foreach (ParticleSystem wp in waterParticle)
                            {
                                if (wp != null)
                                {
                                    wp.Stop();
                                }
                            }
                        }
                    }
                }
                break;

            case "toggleDayNight":
                if (jobj != null && jobj["isDay"] != null)
                {
                    bool isDay = jobj["isDay"].ToObject<bool>();
                    RenderSettings.skybox = isDay ? daySkybox : nightSkybox;
                    DynamicGI.UpdateEnvironment();
                }
                break;

            case "ledLevel":
                if (jobj != null && jobj["level"] != null)
                {
                    int level = jobj["level"].ToObject<int>();
                    Debug.Log($"LED Level set to: {level}");

                    if (ledLights != null && ledLights.Length > 0)
                    {
                        Debug.Log($"Found {ledLights.Length} LED lights");
                        for (int i = 0; i < ledLights.Length; i++)
                        {
                            if (ledLights[i] != null)
                            {
                                // 0,1,2,3 ������ 0.0, 0.5, 1.0, 1.5 intensity�� ����
                                float intensity = level * 0.5f;
                                float previousIntensity = ledLights[i].intensity;
                                ledLights[i].intensity = intensity;
                                Debug.Log($"Light {i}: intensity changed from {previousIntensity} to {intensity}");
                            }
                            else
                            {
                                Debug.LogError($"LED Light at index {i} is null");
                            }
                        }
                    }
                    else
                    {
                        Debug.LogError("ledLights array is null or empty");
                    }
                }
                break;

            case "fanStatus":
                if (jobj != null && jobj["status"] != null)
                {
                    isFanOn = jobj["status"].ToObject<bool>();
                    if (fanObject != null)
                    {
                        fanObject.SetActive(isFanOn);
                    }
                }
                break;

            default:
                Debug.Log($"Unknown message received: {eventName}");
                break;
        }
    }

    void Update()
    {
        // �޼� Ÿ�̸� ó��
        if (isWatering)
        {
            wateringTimer -= Time.deltaTime;
            if (wateringTimer <= 0f)
            {
                isWatering = false;
                Debug.Log("Water Flow timer ended");

                if (waterParticle != null)
                {
                    foreach (ParticleSystem wp in waterParticle)
                    {
                        if (wp != null)
                            wp.Stop();
                    }
                }
            }
        }

        // �� ȸ��
        if (isFanOn && fanObject != null)
        {
            fanObject.transform.Rotate(Vector3.forward * 200 * Time.deltaTime);
        }
    }
}
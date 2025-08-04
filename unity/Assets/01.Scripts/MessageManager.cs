using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Runtime.InteropServices;
using TMPro;
//using UnityEditor.VersionControl;
using UnityEngine;

[System.Serializable]
public class UnityDataMessage
{
    public string name;
    // JObject�� ����Ͽ� �ٸ� ������ Ÿ�Կ��� �����ϰ� ��ó
    public JObject data;
}

// ���� �ʱ�ȭ ������ ���� �߰�
[System.Serializable]
public class FarmInitData
{
    //public string farmId;
    //public string farmName;
    //public string owner;
    public string farmType;    // "����", "��������"
    public string houseType;   // "����", "�ö�ƽ"
    //public string cropType;    // "����丶��"
}

public class MessageManager : MonoBehaviour
{
    public GameObject fanObject; // �� ȸ�� ���
    public Light[] ledLights;       // �ϻ緮 ������ ����Ʈ
    public ParticleSystem[] waterParticle;  // �޼� �帧 ǥ���� ��ƼŬ
    public GameObject[] temperatureUI; // �µ� �ؽ�Ʈ UI
    public GameObject[] humidityUI;    // ���� �ؽ�Ʈ UI
    public Material daySkybox;
    public Material nightSkybox;

    [Header("Farm Information UI")]
    //public GameObject farmNameUI;      // ����� UI
    //public GameObject ownerUI;         // ������ UI  
    public GameObject farmTypeUI;      // ���Ÿ�� UI
    public GameObject houseTypeUI;      // �½�Ÿ�� UI
    //public GameObject debugUI;         // ����� ���� UI

    private bool isFanOn = false;
    private bool isWatering = false;
    private float wateringTimer = 0f;
    public float flowDuration = 10f;
    public float flowSpeed = 1f;
    private Vector2 startOffset;

    // ������ �µ�/���� �� ���� (�ε��� 0: main, 1-4: ����1-4)
    private float[] temperatures = { 0f, 25f, 25f, 25f, 25f };
    private float[] humidities = { 0f, 50f, 50f, 50f, 50f };

    // ���� ������ ����
    private FarmInitData currentFarmData;

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

        // �ʱ� ���� UI ����
        //UpdateTextComponent(farmNameUI, "���� �ε� ��...", "���� �ε� ��...");
        //UpdateTextComponent(ownerUI, "������: �����", "������: �����");
        UpdateTextComponent(farmTypeUI, "Type: loading...", "Type: loading...");
        UpdateTextComponent(houseTypeUI, "Type: loading...", "Type: loading...");
    }

    private void CheckUIComponents()
    {
        // ���� ���� UI üũ
        //Debug.Log($"Farm Name UI: {(farmNameUI != null ? "OK" : "NULL")}");
        //Debug.Log($"Owner UI: {(ownerUI != null ? "OK" : "NULL")}");
        Debug.Log($"Farm Type UI: {(farmTypeUI != null ? "OK" : "NULL")}");
        Debug.Log($"Farm Type UI: {(houseTypeUI != null ? "OK" : "NULL")}");
        //Debug.Log($"Debug UI: {(debugUI != null ? "OK" : "NULL")}");
    }

    public void ReceiveMessage(string json)
    {
        try
        {
            Debug.Log($"Received JSON: {json}");

            // JSON �Ľ� �õ�
            UnityDataMessage jsonData = JsonConvert.DeserializeObject<UnityDataMessage>(json);

            if (jsonData == null || jsonData.data == null)
            {
                Debug.LogError("Failed to deserialize JSON message");
                return;
            }

            Debug.Log($"Event name: {jsonData.name}");

            // �̺�Ʈ �̸��� ���� data ��ü ó��
            if (jsonData.name == "INITIALIZE_FARM")
            {
                // JObject�� FarmInitData�� ��ȯ
                FarmInitData farmData = jsonData.data.ToObject<FarmInitData>();
                InitializeFarmData(farmData);
            }
            else
            {
                // �ٸ� ��� �̺�Ʈ�� ProcessMessage�� ����
                ProcessMessage(jsonData.name, jsonData.data);
            }
        }
        catch (Exception e)
        {
            Debug.LogError($"Error in ReceiveMessage: {e.Message}");
        }
    }

    // ���� �ʱ�ȭ �޼��� �߰� (React���� ���� ȣ�� ����)
    public void InitializeFarmData(FarmInitData farmData)
    {
        try
        {
            currentFarmData = farmData;
            // ���� UI ������Ʈ
            UpdateFarmUI(farmData);
        }
        catch (Exception e)
        {
            Debug.LogError($"���� �ʱ�ȭ ����: {e.Message}");
            //UpdateTextComponent(debugUI, $"�ʱ�ȭ ����: {e.Message}", $"�ʱ�ȭ ����: {e.Message}");
        }
    }

    private void UpdateFarmUI(FarmInitData farmData)
    {
        try
        {
            Debug.Log("���� UI ������Ʈ ����...");

            //if (farmNameUI != null)
            //{
            //    UpdateTextComponent(farmNameUI, farmData.farmName, farmData.farmName);
            //}
            //else
            //{
            //    Debug.LogWarning("farmNameUI�� �Ҵ���� ����");
            //}

            //if (ownerUI != null)
            //{
            //    string ownerText = $"{farmData.owner}";
            //    UpdateTextComponent(ownerUI, ownerText, ownerText);
            //}
            //else
            //{
            //    Debug.LogWarning("ownerUI�� �Ҵ���� ����");
            //}

            if (farmTypeUI != null)
            {
                string typeText = $"{farmData.farmType}";
                UpdateTextComponent(farmTypeUI, typeText, typeText);
                Debug.Log($"{typeText}");
            }
            else
            {
                Debug.LogWarning("farmTypeUI�� �Ҵ���� ����");
            }

            if (houseTypeUI != null)
            {
                string typeText = $"{farmData.houseType}";
                UpdateTextComponent(houseTypeUI, typeText, typeText);
                Debug.Log($"{typeText}");
            }
            else
            {
                Debug.LogWarning("farmTypeUI�� �Ҵ���� ����");
            }

            Debug.Log("��� ���� UI ������Ʈ �Ϸ�");
        }
        catch (Exception e)
        {
            Debug.LogError($"���� UI ������Ʈ ����: {e.Message}");
        }
    }

    private void ProcessMessage(string eventName, JObject jobj)
    {
        switch (eventName)
        {
            case "temp":
                UpdateSensorTemperature(0, jobj); 
                break;
            case "tempControl1":
                UpdateSensorTemperature(1, jobj);
                break;
            case "tempControl2":
                UpdateSensorTemperature(2, jobj);
                break;
            case "tempControl3":
                UpdateSensorTemperature(3, jobj);
                break;
            case "tempControl4":
                UpdateSensorTemperature(4, jobj);
                break;

            case "humid":
                UpdateSensorHumidity(0, jobj);
                break;
            case "humidControl1":
                UpdateSensorHumidity(1, jobj);
                break;
            case "humidControl2":
                UpdateSensorHumidity(2, jobj);
                break;
            case "humidControl3":
                UpdateSensorHumidity(3, jobj);
                break;
            case "humidControl4":
                UpdateSensorHumidity(4, jobj);
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

    private void UpdateSensorTemperature(int sensorNum, JObject jobj)
    {
        if (jobj != null && jobj["value"] != null)
        {
            float temp = jobj["value"].ToObject<float>();
            temperatures[sensorNum] = temp; // �迭 �ε��� 0-4�� ����
            Debug.Log($"Sensor {sensorNum} temperature updated to: {temp}��C");

            // UI ������Ʈ (�迭 �ε����� 1-4 ���)
            if (temperatureUI != null && sensorNum < temperatureUI.Length && temperatureUI[sensorNum] != null)
            {
                UpdateTextComponent(temperatureUI[sensorNum], $"{temp}��C", $"����{sensorNum} �µ�: {temp}��C");
            }
            else
            {
                Debug.LogError($"temperatureUI[{sensorNum}] is null or index out of bounds");
            }
        }
    }

    private void UpdateSensorHumidity(int sensorNum, JObject jobj)
    {
        if (jobj != null && jobj["value"] != null)
        {
            float humid = jobj["value"].ToObject<float>();
            humidities[sensorNum] = humid; // �迭 �ε��� 0-4�� ����
            Debug.Log($"Sensor {sensorNum} humidity updated to: {humid}%");

            // UI ������Ʈ (�迭 �ε����� 1-4 ���)
            if (humidityUI != null && sensorNum < humidityUI.Length && humidityUI[sensorNum] != null)
            {
                UpdateTextComponent(humidityUI[sensorNum], $"{humid}%", $"����{sensorNum} ����: {humid}%");
            }
            else
            {
                Debug.LogError($"humidityUI[{sensorNum}] is null or index out of bounds");
            }
        }
    }

    private void UpdateAllTemperatureUI()
    {
        for (int i = 1; i < temperatures.Length; i++)
        {
            if (temperatureUI != null && i < temperatureUI.Length && temperatureUI[i] != null)
            {
                UpdateTextComponent(temperatureUI[i], $"{temperatures[i]}��C", $"����{i} �µ�: {temperatures[i]}��C");
            }
        }
    }

    private void UpdateAllHumidityUI()
    {
        for (int i = 1; i < humidities.Length; i++)
        {
            if (humidityUI != null && i < humidityUI.Length && humidityUI[i] != null)
            {
                UpdateTextComponent(humidityUI[i], $"{humidities[i]}%", $"����{i} ����: {humidities[i]}%");
            }
        }
    }

    private void UpdateTextComponent(GameObject uiObject, string simpleText, string detailedText)
    {
        // TextMeshProUGUI ������Ʈ (UI Canvas��)
        TextMeshProUGUI textMeshProUI = uiObject.GetComponent<TextMeshProUGUI>();
        if (textMeshProUI != null)
        {
            textMeshProUI.text = simpleText;
            Debug.Log($"TextMeshProUGUI updated: {textMeshProUI.text}");
            return;
        }

        // TextMeshPro ������Ʈ (3D World Space��)
        TextMeshPro textMeshPro = uiObject.GetComponent<TextMeshPro>();
        if (textMeshPro != null)
        {
            textMeshPro.text = detailedText;
            Debug.Log($"TextMeshPro updated: {textMeshPro.text}");
            return;
        }

        // �⺻ UI Text ������Ʈ (Legacy)
        UnityEngine.UI.Text legacyText = uiObject.GetComponent<UnityEngine.UI.Text>();
        if (legacyText != null)
        {
            legacyText.text = detailedText;
            Debug.Log($"Legacy UI Text updated: {legacyText.text}");
            return;
        }

        Debug.LogError($"No TextMeshProUGUI, TextMeshPro, or UI Text component found on {uiObject.name}");
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
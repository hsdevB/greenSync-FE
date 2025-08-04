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
    // JObject를 사용하여 다른 데이터 타입에도 유연하게 대처
    public JObject data;
}

// 농장 초기화 데이터 구조 추가
[System.Serializable]
public class FarmInitData
{
    //public string farmId;
    //public string farmName;
    //public string owner;
    public string farmType;    // "수경", "고형배지"
    public string houseType;   // "유리", "플라스틱"
    //public string cropType;    // "방울토마토"
}

public class MessageManager : MonoBehaviour
{
    public GameObject fanObject; // 팬 회전 대상
    public Light[] ledLights;       // 일사량 조절용 라이트
    public ParticleSystem[] waterParticle;  // 급수 흐름 표현용 파티클
    public GameObject[] temperatureUI; // 온도 텍스트 UI
    public GameObject[] humidityUI;    // 습도 텍스트 UI
    public Material daySkybox;
    public Material nightSkybox;

    [Header("Farm Information UI")]
    //public GameObject farmNameUI;      // 농장명 UI
    //public GameObject ownerUI;         // 농장주 UI  
    public GameObject farmTypeUI;      // 재배타입 UI
    public GameObject houseTypeUI;      // 온실타입 UI
    //public GameObject debugUI;         // 디버그 정보 UI

    private bool isFanOn = false;
    private bool isWatering = false;
    private float wateringTimer = 0f;
    public float flowDuration = 10f;
    public float flowSpeed = 1f;
    private Vector2 startOffset;

    // 센서별 온도/습도 값 저장 (인덱스 0: main, 1-4: 센서1-4)
    private float[] temperatures = { 0f, 25f, 25f, 25f, 25f };
    private float[] humidities = { 0f, 50f, 50f, 50f, 50f };

    // 농장 데이터 저장
    private FarmInitData currentFarmData;

    [DllImport("__Internal")]
    private static extern void SendMessageToReact(string msg);

    void Start()
    {
        // 컴포넌트 확인
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

        // 초기화 시 모든 파티클 시스템 정지
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

        // 초기 상태 설정
        isWatering = false;
        wateringTimer = 0f;

        // 초기 농장 UI 설정
        //UpdateTextComponent(farmNameUI, "농장 로딩 중...", "농장 로딩 중...");
        //UpdateTextComponent(ownerUI, "농장주: 대기중", "농장주: 대기중");
        UpdateTextComponent(farmTypeUI, "Type: loading...", "Type: loading...");
        UpdateTextComponent(houseTypeUI, "Type: loading...", "Type: loading...");
    }

    private void CheckUIComponents()
    {
        // 농장 정보 UI 체크
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

            // JSON 파싱 시도
            UnityDataMessage jsonData = JsonConvert.DeserializeObject<UnityDataMessage>(json);

            if (jsonData == null || jsonData.data == null)
            {
                Debug.LogError("Failed to deserialize JSON message");
                return;
            }

            Debug.Log($"Event name: {jsonData.name}");

            // 이벤트 이름에 따라 data 객체 처리
            if (jsonData.name == "INITIALIZE_FARM")
            {
                // JObject를 FarmInitData로 변환
                FarmInitData farmData = jsonData.data.ToObject<FarmInitData>();
                InitializeFarmData(farmData);
            }
            else
            {
                // 다른 모든 이벤트는 ProcessMessage로 전달
                ProcessMessage(jsonData.name, jsonData.data);
            }
        }
        catch (Exception e)
        {
            Debug.LogError($"Error in ReceiveMessage: {e.Message}");
        }
    }

    // 농장 초기화 메서드 추가 (React에서 직접 호출 가능)
    public void InitializeFarmData(FarmInitData farmData)
    {
        try
        {
            currentFarmData = farmData;
            // 농장 UI 업데이트
            UpdateFarmUI(farmData);
        }
        catch (Exception e)
        {
            Debug.LogError($"농장 초기화 실패: {e.Message}");
            //UpdateTextComponent(debugUI, $"초기화 실패: {e.Message}", $"초기화 실패: {e.Message}");
        }
    }

    private void UpdateFarmUI(FarmInitData farmData)
    {
        try
        {
            Debug.Log("농장 UI 업데이트 시작...");

            //if (farmNameUI != null)
            //{
            //    UpdateTextComponent(farmNameUI, farmData.farmName, farmData.farmName);
            //}
            //else
            //{
            //    Debug.LogWarning("farmNameUI가 할당되지 않음");
            //}

            //if (ownerUI != null)
            //{
            //    string ownerText = $"{farmData.owner}";
            //    UpdateTextComponent(ownerUI, ownerText, ownerText);
            //}
            //else
            //{
            //    Debug.LogWarning("ownerUI가 할당되지 않음");
            //}

            if (farmTypeUI != null)
            {
                string typeText = $"{farmData.farmType}";
                UpdateTextComponent(farmTypeUI, typeText, typeText);
                Debug.Log($"{typeText}");
            }
            else
            {
                Debug.LogWarning("farmTypeUI가 할당되지 않음");
            }

            if (houseTypeUI != null)
            {
                string typeText = $"{farmData.houseType}";
                UpdateTextComponent(houseTypeUI, typeText, typeText);
                Debug.Log($"{typeText}");
            }
            else
            {
                Debug.LogWarning("farmTypeUI가 할당되지 않음");
            }

            Debug.Log("모든 농장 UI 업데이트 완료");
        }
        catch (Exception e)
        {
            Debug.LogError($"농장 UI 업데이트 실패: {e.Message}");
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

                    // 급수 시작 조건: 요청이 true이고 현재 급수 중이 아닐 때만
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
                    // 급수 중지 요청
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
                                // 0,1,2,3 레벨을 0.0, 0.5, 1.0, 1.5 intensity로 매핑
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
            temperatures[sensorNum] = temp; // 배열 인덱스 0-4에 저장
            Debug.Log($"Sensor {sensorNum} temperature updated to: {temp}°C");

            // UI 업데이트 (배열 인덱스도 1-4 사용)
            if (temperatureUI != null && sensorNum < temperatureUI.Length && temperatureUI[sensorNum] != null)
            {
                UpdateTextComponent(temperatureUI[sensorNum], $"{temp}°C", $"센서{sensorNum} 온도: {temp}°C");
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
            humidities[sensorNum] = humid; // 배열 인덱스 0-4에 저장
            Debug.Log($"Sensor {sensorNum} humidity updated to: {humid}%");

            // UI 업데이트 (배열 인덱스도 1-4 사용)
            if (humidityUI != null && sensorNum < humidityUI.Length && humidityUI[sensorNum] != null)
            {
                UpdateTextComponent(humidityUI[sensorNum], $"{humid}%", $"센서{sensorNum} 습도: {humid}%");
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
                UpdateTextComponent(temperatureUI[i], $"{temperatures[i]}°C", $"센서{i} 온도: {temperatures[i]}°C");
            }
        }
    }

    private void UpdateAllHumidityUI()
    {
        for (int i = 1; i < humidities.Length; i++)
        {
            if (humidityUI != null && i < humidityUI.Length && humidityUI[i] != null)
            {
                UpdateTextComponent(humidityUI[i], $"{humidities[i]}%", $"센서{i} 습도: {humidities[i]}%");
            }
        }
    }

    private void UpdateTextComponent(GameObject uiObject, string simpleText, string detailedText)
    {
        // TextMeshProUGUI 컴포넌트 (UI Canvas용)
        TextMeshProUGUI textMeshProUI = uiObject.GetComponent<TextMeshProUGUI>();
        if (textMeshProUI != null)
        {
            textMeshProUI.text = simpleText;
            Debug.Log($"TextMeshProUGUI updated: {textMeshProUI.text}");
            return;
        }

        // TextMeshPro 컴포넌트 (3D World Space용)
        TextMeshPro textMeshPro = uiObject.GetComponent<TextMeshPro>();
        if (textMeshPro != null)
        {
            textMeshPro.text = detailedText;
            Debug.Log($"TextMeshPro updated: {textMeshPro.text}");
            return;
        }

        // 기본 UI Text 컴포넌트 (Legacy)
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
        // 급수 타이머 처리
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

        // 팬 회전
        if (isFanOn && fanObject != null)
        {
            fanObject.transform.Rotate(Vector3.forward * 200 * Time.deltaTime);
        }
    }
}
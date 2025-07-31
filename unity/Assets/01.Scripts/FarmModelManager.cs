//using UnityEngine;
//using System.Runtime.InteropServices;
//using Newtonsoft.Json;
//using Newtonsoft.Json.Linq;
//using System;
//using TMPro;
//using System.Collections;

//// 농장 초기화 데이터 구조
//[System.Serializable]
//public class FarmInitData
//{
//    public string farmId;
//    public string farmName;
//    public string owner;
//    public string farmType;    // "수경", "고형배지"
//    public string houseType;   // "유리", "플라스틱"
//    public string cropType;    // "방울토마토"
//    //public string location;
//    //public string establishedDate;
//    //public string totalArea;
//}

//// 기존 MessageManager에 농장 초기화 기능 추가
//public class FarmModelManager : MonoBehaviour
//{
//    [Header("Farm Models - Prefabs")]
//    public GameObject solidGlassFarm;    // 고형배지 + 유리 (SG)
//    public GameObject solidPlasticFarm;    // 고형배지 + 플라스틱 (SP)  
//    public GameObject hydroGlassFarm;   // 수경 + 유리 (WG)
//    public GameObject hydroPlasticFarm;   // 수경 + 플라스틱 (WP)

//    //[Header("Crop Models")]
//    //public GameObject tomatoSeedling;   // 방울토마토 모종
//    //public GameObject tomatoGrowing;    // 성장기 토마토
//    //public GameObject tomatoFlowering;  // 개화기 토마토
//    //public GameObject tomatoFruiting;   // 결실기 토마토

//    [Header("UI Elements")]
//    public TextMeshProUGUI farmNameText;
//    public TextMeshProUGUI ownerText;
//    //public TextMeshProUGUI locationText;
//    public TextMeshProUGUI farmTypeText;

//    private GameObject[] currentCropModels;
//    private FarmInitData currentFarmData;

//    // MessageManager 참조 (센서 데이터 처리용)
//    private MessageManager messageManager;

//    void Start()
//    {
//        messageManager = GetComponent<MessageManager>();
//        if (messageManager == null)
//        {
//            Debug.LogError("MessageManager not found on same GameObject!");
//        }
//    }

//    // React에서 농장 초기화 데이터 받기
//    public void InitializeFarmData(string farmDataJson)
//    {
//        try
//        {
//            Debug.Log($"Initializing farm with data: {farmDataJson}");

//            FarmInitData farmData = JsonConvert.DeserializeObject<FarmInitData>(farmDataJson);
//            currentFarmData = farmData;

//            //// 작물 모델 로드 (방울토마토)
//            //LoadCropModels(farmData.cropType);

//            // UI 업데이트
//            UpdateFarmUI(farmData);

//            Debug.Log($"Farm initialized: {farmData.farmName} ({farmData.farmType} + {farmData.houseType})");

//        }
//        catch (Exception e)
//        {
//            Debug.LogError($"Error initializing farm: {e.Message}");
//        }
//    }

//    //private void LoadCropModels(string cropType)
//    //{
//    //    if (cropType == "방울토마토")
//    //    {
//    //        // 기본적으로 성장기 토마토 로드 (나중에 성장 단계별로 변경 가능)
//    //        Vector3[] cropPositions = GetCropPositions();
//    //        currentCropModels = new GameObject[cropPositions.Length];

//    //        for (int i = 0; i < cropPositions.Length; i++)
//    //        {
//    //            GameObject cropInstance = Instantiate(tomatoGrowing, cropPositions[i], Quaternion.identity);
//    //            cropInstance.name = $"Tomato_{i}";
//    //            currentCropModels[i] = cropInstance;
//    //        }

//    //        Debug.Log($"Loaded {cropPositions.Length} tomato plants");
//    //    }
//    //}

//    //private Vector3[] GetCropPositions()
//    //{
//    //    // 농장 타입에 따른 작물 배치 위치 반환
//    //    // 실제로는 농장 모델 내의 마커 위치를 사용하거나 
//    //    // 농장 타입별로 다른 배치 패턴 적용
//    //    return new Vector3[]
//    //    {
//    //        new Vector3(-2, 0, -2),
//    //        new Vector3(-2, 0, 0),
//    //        new Vector3(-2, 0, 2),
//    //        new Vector3(0, 0, -2),
//    //        new Vector3(0, 0, 0),
//    //        new Vector3(0, 0, 2),
//    //        new Vector3(2, 0, -2),
//    //        new Vector3(2, 0, 0),
//    //        new Vector3(2, 0, 2)
//    //    };
//    //}

//    private void UpdateFarmUI(FarmInitData farmData)
//    {
//        if (farmNameText != null)
//            farmNameText.text = farmData.farmName;

//        if (ownerText != null)
//            ownerText.text = $"농장주: {farmData.owner}";

//        //if (locationText != null)
//        //    locationText.text = farmData.location;

//        if (farmTypeText != null)
//            farmTypeText.text = $"{farmData.farmType} ({farmData.houseType})";
//    }

//    //private void UpdateMessageManagerReferences()
//    //{
//    //    if (currentFarmModel == null || messageManager == null) return;

//    //    // 새로 로드된 농장 모델에서 센서/장비 오브젝트들을 찾아서 MessageManager에 연결

//    //    // 팬 오브젝트 찾기
//    //    Transform fanTransform = currentFarmModel.transform.Find("Fan");
//    //    if (fanTransform != null)
//    //    {
//    //        messageManager.fanObject = fanTransform.gameObject;
//    //    }

//    //    // LED 라이트들 찾기
//    //    Light[] lights = currentFarmModel.GetComponentsInChildren<Light>();
//    //    messageManager.ledLights = lights;

//    //    // 급수 파티클 시스템들 찾기
//    //    ParticleSystem[] particles = currentFarmModel.GetComponentsInChildren<ParticleSystem>();
//    //    messageManager.waterParticle = particles;

//    //    // 온도/습도 UI 텍스트들 찾기
//    //    GameObject[] tempUIs = new GameObject[5]; // main + sensor1-4
//    //    GameObject[] humidUIs = new GameObject[5];

//    //    for (int i = 0; i < 5; i++)
//    //    {
//    //        string tempName = i == 0 ? "MainTemperatureText" : $"Sensor{i}TemperatureText";
//    //        string humidName = i == 0 ? "MainHumidityText" : $"Sensor{i}HumidityText";

//    //        Transform tempTransform = currentFarmModel.transform.Find(tempName);
//    //        Transform humidTransform = currentFarmModel.transform.Find(humidName);

//    //        if (tempTransform != null) tempUIs[i] = tempTransform.gameObject;
//    //        if (humidTransform != null) humidUIs[i] = humidTransform.gameObject;
//    //    }

//    //    messageManager.temperatureUI = tempUIs;
//    //    messageManager.humidityUI = humidUIs;

//    //    Debug.Log("MessageManager references updated for new farm model");
//    //}

//    // 작물 성장 단계 변경 (React에서 호출 가능)
//    //public void UpdateCropGrowthStage(string stage)
//    //{
//    //    GameObject newCropPrefab = null;

//    //    switch (stage)
//    //    {
//    //        case "발아기":
//    //            newCropPrefab = tomatoSeedling;
//    //            break;
//    //        case "성장기":
//    //            newCropPrefab = tomatoGrowing;
//    //            break;
//    //        case "개화기":
//    //            newCropPrefab = tomatoFlowering;
//    //            break;
//    //        case "결실기":
//    //            newCropPrefab = tomatoFruiting;
//    //            break;
//    //    }

//    //    if (newCropPrefab != null && currentCropModels != null)
//    //    {
//    //        Vector3[] positions = GetCropPositions();

//    //        // 기존 작물 제거
//    //        for (int i = 0; i < currentCropModels.Length; i++)
//    //        {
//    //            if (currentCropModels[i] != null)
//    //            {
//    //                DestroyImmediate(currentCropModels[i]);
//    //            }
//    //        }

//    //        // 새 성장 단계 작물 생성
//    //        for (int i = 0; i < positions.Length; i++)
//    //        {
//    //            GameObject cropInstance = Instantiate(newCropPrefab, positions[i], Quaternion.identity);
//    //            cropInstance.name = $"Tomato_{stage}_{i}";
//    //            currentCropModels[i] = cropInstance;
//    //        }

//    //        Debug.Log($"Updated crop growth stage to: {stage}");
//    //    }
//    //}

//    // 농장 정보 업데이트 (React에서 호출 가능)
//    public void UpdateFarmInfo(string updateDataJson)
//    {
//        try
//        {
//            JObject updateData = JObject.Parse(updateDataJson);

//            if (updateData["farmName"] != null)
//            {
//                currentFarmData.farmName = updateData["farmName"].ToString();
//                if (farmNameText != null) farmNameText.text = currentFarmData.farmName;
//            }

//            //if (updateData["location"] != null)
//            //{
//            //    currentFarmData.location = updateData["location"].ToString();
//            //    if (locationText != null) locationText.text = currentFarmData.location;
//            //}

//            Debug.Log("Farm info updated");
//        }
//        catch (Exception e)
//        {
//            Debug.LogError($"Error updating farm info: {e.Message}");
//        }
//    }
//}
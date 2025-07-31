//using UnityEngine;
//using System.Runtime.InteropServices;
//using Newtonsoft.Json;
//using Newtonsoft.Json.Linq;
//using System;
//using TMPro;
//using System.Collections;

//// ���� �ʱ�ȭ ������ ����
//[System.Serializable]
//public class FarmInitData
//{
//    public string farmId;
//    public string farmName;
//    public string owner;
//    public string farmType;    // "����", "��������"
//    public string houseType;   // "����", "�ö�ƽ"
//    public string cropType;    // "����丶��"
//    //public string location;
//    //public string establishedDate;
//    //public string totalArea;
//}

//// ���� MessageManager�� ���� �ʱ�ȭ ��� �߰�
//public class FarmModelManager : MonoBehaviour
//{
//    [Header("Farm Models - Prefabs")]
//    public GameObject solidGlassFarm;    // �������� + ���� (SG)
//    public GameObject solidPlasticFarm;    // �������� + �ö�ƽ (SP)  
//    public GameObject hydroGlassFarm;   // ���� + ���� (WG)
//    public GameObject hydroPlasticFarm;   // ���� + �ö�ƽ (WP)

//    //[Header("Crop Models")]
//    //public GameObject tomatoSeedling;   // ����丶�� ����
//    //public GameObject tomatoGrowing;    // ����� �丶��
//    //public GameObject tomatoFlowering;  // ��ȭ�� �丶��
//    //public GameObject tomatoFruiting;   // ��Ǳ� �丶��

//    [Header("UI Elements")]
//    public TextMeshProUGUI farmNameText;
//    public TextMeshProUGUI ownerText;
//    //public TextMeshProUGUI locationText;
//    public TextMeshProUGUI farmTypeText;

//    private GameObject[] currentCropModels;
//    private FarmInitData currentFarmData;

//    // MessageManager ���� (���� ������ ó����)
//    private MessageManager messageManager;

//    void Start()
//    {
//        messageManager = GetComponent<MessageManager>();
//        if (messageManager == null)
//        {
//            Debug.LogError("MessageManager not found on same GameObject!");
//        }
//    }

//    // React���� ���� �ʱ�ȭ ������ �ޱ�
//    public void InitializeFarmData(string farmDataJson)
//    {
//        try
//        {
//            Debug.Log($"Initializing farm with data: {farmDataJson}");

//            FarmInitData farmData = JsonConvert.DeserializeObject<FarmInitData>(farmDataJson);
//            currentFarmData = farmData;

//            //// �۹� �� �ε� (����丶��)
//            //LoadCropModels(farmData.cropType);

//            // UI ������Ʈ
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
//    //    if (cropType == "����丶��")
//    //    {
//    //        // �⺻������ ����� �丶�� �ε� (���߿� ���� �ܰ躰�� ���� ����)
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
//    //    // ���� Ÿ�Կ� ���� �۹� ��ġ ��ġ ��ȯ
//    //    // �����δ� ���� �� ���� ��Ŀ ��ġ�� ����ϰų� 
//    //    // ���� Ÿ�Ժ��� �ٸ� ��ġ ���� ����
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
//            ownerText.text = $"������: {farmData.owner}";

//        //if (locationText != null)
//        //    locationText.text = farmData.location;

//        if (farmTypeText != null)
//            farmTypeText.text = $"{farmData.farmType} ({farmData.houseType})";
//    }

//    //private void UpdateMessageManagerReferences()
//    //{
//    //    if (currentFarmModel == null || messageManager == null) return;

//    //    // ���� �ε�� ���� �𵨿��� ����/��� ������Ʈ���� ã�Ƽ� MessageManager�� ����

//    //    // �� ������Ʈ ã��
//    //    Transform fanTransform = currentFarmModel.transform.Find("Fan");
//    //    if (fanTransform != null)
//    //    {
//    //        messageManager.fanObject = fanTransform.gameObject;
//    //    }

//    //    // LED ����Ʈ�� ã��
//    //    Light[] lights = currentFarmModel.GetComponentsInChildren<Light>();
//    //    messageManager.ledLights = lights;

//    //    // �޼� ��ƼŬ �ý��۵� ã��
//    //    ParticleSystem[] particles = currentFarmModel.GetComponentsInChildren<ParticleSystem>();
//    //    messageManager.waterParticle = particles;

//    //    // �µ�/���� UI �ؽ�Ʈ�� ã��
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

//    // �۹� ���� �ܰ� ���� (React���� ȣ�� ����)
//    //public void UpdateCropGrowthStage(string stage)
//    //{
//    //    GameObject newCropPrefab = null;

//    //    switch (stage)
//    //    {
//    //        case "�߾Ʊ�":
//    //            newCropPrefab = tomatoSeedling;
//    //            break;
//    //        case "�����":
//    //            newCropPrefab = tomatoGrowing;
//    //            break;
//    //        case "��ȭ��":
//    //            newCropPrefab = tomatoFlowering;
//    //            break;
//    //        case "��Ǳ�":
//    //            newCropPrefab = tomatoFruiting;
//    //            break;
//    //    }

//    //    if (newCropPrefab != null && currentCropModels != null)
//    //    {
//    //        Vector3[] positions = GetCropPositions();

//    //        // ���� �۹� ����
//    //        for (int i = 0; i < currentCropModels.Length; i++)
//    //        {
//    //            if (currentCropModels[i] != null)
//    //            {
//    //                DestroyImmediate(currentCropModels[i]);
//    //            }
//    //        }

//    //        // �� ���� �ܰ� �۹� ����
//    //        for (int i = 0; i < positions.Length; i++)
//    //        {
//    //            GameObject cropInstance = Instantiate(newCropPrefab, positions[i], Quaternion.identity);
//    //            cropInstance.name = $"Tomato_{stage}_{i}";
//    //            currentCropModels[i] = cropInstance;
//    //        }

//    //        Debug.Log($"Updated crop growth stage to: {stage}");
//    //    }
//    //}

//    // ���� ���� ������Ʈ (React���� ȣ�� ����)
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